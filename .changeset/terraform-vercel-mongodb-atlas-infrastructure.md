---
"ghostmsg": minor
---

The Vercel project and the MongoDB Atlas cluster are now managed as code with Terraform instead of by hand in each dashboard.

- **Terraform:** new `terraform/` directory (state in HCP Terraform, CLI-driven) manages the Vercel project's settings and build command, every synced environment variable, and the Atlas project/cluster/database users/network access list (ADR 0032).
- **Per-environment env vars:** `app_env_vars` sets independent Production/Preview values per key (or omits either); `MONGODB_URI` is built automatically per environment from dedicated, database-scoped Atlas users instead of being typed in by hand.
- **Isolation:** one free M0 Atlas cluster now hosts two database users, each scoped `readWrite` to only its own database, so Preview can never read or write Production data.
- **Deliberately out of scope:** the Vercel Cron schedule stays in `vercel.json` (the Vercel Terraform provider has no cron resource); OIDC tokens and deployment protection settings are explicitly excluded from management.
- **Fix:** a shared Production/Preview `NEXTAUTH_URL` value briefly broke Google sign-in on Preview deployments and after a local `vercel env pull`; `terraform/README.md` §7 documents this and the write-only behavior of Vercel's sensitive environment variables.
- **Docs:** ADR 0032, `terraform/README.md`, updates to Chapters 2 and 9.
