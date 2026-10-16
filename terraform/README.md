# Terraform: Vercel project + MongoDB Atlas cluster

If you've never used Terraform: it reads `.tf` files in this directory, compares
them to what actually exists in Vercel/Atlas, and shows you a **plan** (a diff)
before changing anything. Nothing happens until you type `terraform apply` and
confirm. Nothing here auto-runs on push; you run it from your machine.

## The model in one picture

```mermaid
flowchart TB
    subgraph TFC["HCP Terraform (state)"]
        WS["workspace: ghostmsg<br/>org: PersonalAbbasSpace"]
    end
    subgraph Local["terraform/ (this directory, run by hand)"]
        CLI["terraform plan / apply"]
    end
    CLI <--> WS

    subgraph VercelP["Vercel provider"]
        VP["vercel_project.ghostmsg<br/>adopted via import, never recreated"]
        VE["vercel_project_environment_variable<br/>one per (name, environment)"]
        VP --- VE
    end
    subgraph AtlasP["MongoDB Atlas provider"]
        AP["mongodbatlas_project<br/>'Project 0' (adopted via import)"]
        AC["mongodbatlas_cluster<br/>'Abbas-Shaikh' M0 (adopted via import)"]
        AU["mongodbatlas_database_user ×2<br/>production → honest_feedback<br/>preview → honest_feedback_preview"]
        AP --> AC --> AU
    end

    CLI --> VP
    CLI --> AP
    AU -. "MONGODB_URI, built per environment" .-> VE

    subgraph OOS["Stays manual, out of scope on purpose"]
        CRON["vercel.json cron schedule<br/>(no provider resource exists)"]
        SEC["oidc_token_config · vercel_authentication ·<br/>protection_bypass_for_automation_secret"]
    end
```

"Adopted via import" means the real Vercel project and Atlas cluster already
existed before Terraform did. §6 has the exact commands. The grey "stays
manual" box is deliberate ([ADR 0032](../docs/adr/0032-terraform-managed-vercel-and-mongodb-atlas-infrastructure.md) D3, D9), not an oversight.

## What's in this directory

| File | What it does |
| :--- | :--- |
| [`versions.tf`](versions.tf) | Which providers (Vercel, Atlas) and where state is stored (Terraform Cloud). |
| [`variables.tf`](variables.tf) | Every input this config needs: API keys, passwords, the env var map. |
| [`locals.tf`](locals.tf) | Small computed helpers used by the other files (explained in §4 below). |
| [`vercel.tf`](vercel.tf) | The Vercel project + every environment variable. |
| [`mongodbatlas.tf`](mongodbatlas.tf) | The Atlas project, cluster, two DB users, network access. |
| [`outputs.tf`](outputs.tf) | Values printed after `apply` (ids, usernames, etc.). |
| [`terraform.tfvars.example`](terraform.tfvars.example) | Template for your real values. Copy it, don't edit it in place. |

## 1. Prerequisites

- A [Terraform Cloud](https://app.terraform.io) account (free) with an
  organization, and a workspace inside it named `ghostmsg`, set to the
  **CLI-driven** workflow (not VCS-driven: this directory lives inside the
  main repo, so Terraform Cloud shouldn't watch the repo itself).
- A Vercel API token: Vercel dashboard → Account Settings → Tokens → Create.
- An Atlas API key pair: Atlas → Organization Settings → Access Manager →
  API Keys → Create API Key, with Project Owner permissions. Note the
  **Organization ID** shown on that same settings page too.
- Terraform itself: `winget install Hashicorp.Terraform` (or see
  terraform.io/downloads), version >= 1.7.

## 2. First-time setup

```bash
cd terraform
terraform login                 # opens a browser to generate a Terraform Cloud token
```

Open [`versions.tf`](versions.tf) and change `cloud.organization` from the
placeholder to your real Terraform Cloud org name.

```bash
terraform init
```

This downloads the Vercel and Atlas providers and connects to your Terraform
Cloud workspace. Re-run it any time you edit `versions.tf`.

## 3. Set your variables

Copy the example file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars` is gitignored on purpose: it's where your real secrets go
for local runs. Fill in:

- `vercel_api_token`, `mongodbatlas_public_key`, `mongodbatlas_private_key`,
  `mongodbatlas_org_id`: from step 1.
- `mongodbatlas_db_password_production` / `_preview`: generate two strong,
  different passwords (e.g. `openssl rand -base64 24`).
- `app_env_vars`: see §4.

If you'd rather run `apply` from Terraform Cloud's UI/CI instead of your
machine, set these same names as **workspace variables** there instead of in
`terraform.tfvars`, marking the sensitive ones as sensitive. `app_env_vars` is
entered there as a single HCL-typed variable (paste the same `{ ... }` block
you'd put in `terraform.tfvars`).

## 4. Goal 1: env vars synced to Vercel, different per environment

`app_env_vars` in [`variables.tf`](variables.tf) is a map where each entry can
set a different value for `production`, `preview`, and/or `development`:

```hcl
app_env_vars = {
  NEXTAUTH_URL = {
    production = "https://ghost-msg.vercel.app"
    sensitive  = false
    # preview omitted on purpose, see the comment in terraform.tfvars.example
  }
  SMTP_HOST = {
    production = "smtp-relay.brevo.com"
    preview    = "sandbox.smtp.mailtrap.io"
    sensitive  = false
  }
}
```

[`vercel.tf`](vercel.tf)'s `vercel_project_environment_variable.app` resource
creates **one Vercel env var per (name, environment) pair that has a value**.
Omit `preview` on an entry and nothing gets created for Preview; the app
falls back to whatever default the code already has (see `.env.example`).

[`locals.tf`](locals.tf)'s `env_var_keys` is what makes this work with
`for_each`: it builds the set of `"NAME::environment"` pairs to create,
without ever touching the secret values themselves. Terraform won't allow a
`for_each` whose keys are derived from a sensitive variable (`app_env_vars`
is marked sensitive so its values never print in plan/apply output), so the
keys have to be built from just the var names and environment names, which
aren't secret.

`MONGODB_URI` is deliberately **not** in `app_env_vars`. It's built
automatically in `vercel.tf` from the Atlas resources in `mongodbatlas.tf`, so
production and preview each get the right database without you ever typing a
connection string. See §5.

To add a new env var: add a key to `app_env_vars`, `terraform apply`. To
change one: edit its value, `terraform apply` (existing deployments won't
pick it up until redeployed, same as doing it by hand in the Vercel dashboard).

## 5. Goal 2: MongoDB and the Vercel cron

**MongoDB.** `mongodbatlas.tf` adopts the existing free **M0** cluster
(project "Project 0", cluster "Abbas-Shaikh", see §6) and adds **two
database users** on it:

- `<prefix>-production`, read/write on database `honest_feedback` (the real, existing production data)
- `<prefix>-preview`, read/write on database `honest_feedback_preview` (new, empty, isolated)

That's one cluster, two isolated databases: preview deployments can never
read or write production data, and vice versa, because each user's role is
scoped to only its own database name. `vercel.tf` then assembles the full
`mongodb+srv://user:pass@host/db?...` string for each environment and sets it
as that environment's `MONGODB_URI`. You never need to copy a connection
string out of the Atlas UI.

If you later want full isolation (a second cluster instead of a second
database), Atlas's free tier caps you at one M0 per *project*; you'd need a
second Atlas project (another `mongodbatlas_project` + `mongodbatlas_cluster`
block) or a paid tier. Not needed to start.

**Vercel cron.** Nothing to do here, and nothing to add. I checked the
Vercel Terraform provider's resources directly (`terraform providers schema`)
and there is no cron resource; Vercel crons are declared in
[`vercel.json`](../vercel.json) as part of the app deployment itself, not as
separate infrastructure, so Terraform has no handle on them. The existing
entry there (`/api/cron/daily-digest` at 17:00 UTC) keeps working exactly as
it does today, unaffected by anything in this directory. The only connection
to Terraform is that `CRON_SECRET`, the bearer token that route checks, is one
of the values you set in `app_env_vars`.

## 6. Importing what already exists

The Vercel project and the Atlas cluster backing today's `MONGODB_URI`
already exist, so this config must **adopt** them, not create duplicates. Run
these once, before your first `terraform apply`:

```bash
# Vercel project id, already known from .vercel/project.json
terraform import vercel_project.ghostmsg prj_pvDTGpjbZpsZB94JdBnZA2EeMcOL

# Atlas: confirmed via the Atlas Admin API (GET /groups, GET /groups/{id}/clusters).
# There are TWO projects in this org: only "Project 0" is the one with real
# data. "GhostMsg" (id 6ad215632c5f48216a492c03) is a separate, unrelated,
# empty project + cluster that happens to share this config's old default
# names. Do not import that one.
terraform import mongodbatlas_project.ghostmsg 670cc22371b1856baf945a9d
terraform import mongodbatlas_cluster.ghostmsg 670cc22371b1856baf945a9d-Abbas-Shaikh
```

The two `mongodbatlas_database_user` resources are **not** imports. They're
brand-new users this config creates (`<prefix>-production`, scoped to the
existing `honest_feedback` database; `<prefix>-preview`, scoped to a new
`honest_feedback_preview`). The pre-existing user (`shaikhabbas54`, currently
in `MONGODB_URI`) is left completely untouched: nothing here reads, rotates,
or deletes its password. Once the new users are confirmed working (the app
redeployed and reading/writing fine through them), you can delete the old
user by hand in the Atlas UI; Terraform never owned it, so it won't do that
for you.

After importing, always run `terraform plan` and read it before `apply`:
confirm it shows no unexpected `destroy` actions.

## 7. Troubleshooting

**Google sign-in redirects to the production domain, landing on
`/sign-in?...&error=OAuthCallback`**, when signing in from `localhost` or from
a Preview deployment. Cause: `NEXTAUTH_URL` is wrong for whichever environment
you're actually running in. NextAuth builds the Google OAuth callback URL
from `NEXTAUTH_URL`, so if it points at the production domain, that's where
the browser ends up after Google redirects back, regardless of where the sign-in
started. Two distinct cases:
- **Local dev:** `.env.local`'s `NEXTAUTH_URL` must stay `http://localhost:3000`.
  Running `vercel env pull` overwrites it with whatever this config set for
  the pulled environment (the production domain, or unset for Preview); change
  it back to `localhost` afterward. See [Chapter 2](../docs/02-getting-started.md#2-environment-variables-configuration).
- **A real Preview deployment:** there is no single correct static value.
  `app_env_vars.NEXTAUTH_URL` in `terraform.tfvars` deliberately has no
  `preview` field for this reason (it briefly did, pointing at the production
  URL, and broke Google sign-in on every Preview deployment the same way).
  Known, unfixed limitation; not something to default to a URL.

**`vercel env pull` writes empty values for most of `app_env_vars`.** Expected
for every key left at the default `sensitive = true`: Vercel's sensitive
variables are write-only once created, not retrievable again by the
dashboard, the API, or `vercel env pull`, by design. The value still reaches
the running deployment fine; only reading it back locally is blocked. To
refresh a local `.env.local` after a pull, copy the values straight out of
`terraform.tfvars` for the keys that came back empty (same values this config
already applied), or write a small script like the one used once already in
this project's setup to do it without ever printing them to a terminal.
Setting a key's `sensitive = false` in `app_env_vars` avoids this entirely,
at the cost of that value being visible in the Vercel dashboard.

**`ENV_CONFLICT - A variable with the name 'X' already exists for the target
...` on your first `apply`.** This happens when the Vercel project already had
that env var set (by hand, or by `vercel env add`, before Terraform ever
touched it) covering the same environment(s) this config is trying to create.
Vercel doesn't allow two objects for the same key with overlapping targets, so
the `create` fails. The error message includes the conflicting object's id,
e.g.:

```
the conflicting environment variable ID is
team_sujhNMhXfFKvroQkhJA7BBaZ/prj_pvDTGpjbZpsZB94JdBnZA2EeMcOL/jv2s5UauZYhTnbuQ
```

Import it instead of fighting it: the id is already `team_id/project_id/env_id`:

```bash
terraform import vercel_project_environment_variable.mongodb_uri_production \
  team_sujhNMhXfFKvroQkhJA7BBaZ/prj_pvDTGpjbZpsZB94JdBnZA2EeMcOL/jv2s5UauZYhTnbuQ
```

(For a key under `app_env_vars`, the address is
`'vercel_project_environment_variable.app["KEY::production"]'`; quote it, the
brackets confuse the shell otherwise.)

If the existing object's `sensitive` flag doesn't match this config (ours
default to `true`; a var set by hand is often `false`), the next `plan` shows
`must be replaced` instead of a clean no-op import: Vercel doesn't allow
flipping that flag in place. That's a same-value delete-then-recreate of just
that one env var, not a real outage; apply it.

One real object can only ever map to **one** Terraform resource address. If a
pre-existing var covered several environments at once (e.g. "production,
preview, development" as a single object) and this config wants different
values per environment, import it into one address (commonly `production`)
and let `apply` shrink its `target` down to just that environment. The other
environments' resources (e.g. `...::preview`) will then create cleanly in the
same `apply`, since the overlap is gone once the shrink lands.

## 8. Day-to-day commands

```bash
terraform plan     # preview changes, safe to run anytime
terraform apply     # apply them, asks for confirmation first
terraform output    # see the outputs.tf values (ids, hostnames)
```
