# The project already exists (.vercel/project.json). Import it before the first
# apply so Terraform adopts it instead of trying to create a duplicate:
#   terraform import vercel_project.ghostmsg prj_pvDTGpjbZpsZB94JdBnZA2EeMcOL
resource "vercel_project" "ghostmsg" {
  name      = var.vercel_project_name
  team_id   = var.vercel_team_id
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = var.github_repo
  }

  # Matches docs/09-deployment-and-operations.md §1: `pnpm typegen && next build`
  build_command = "pnpm build"

  # oidc_token_config and vercel_authentication are security/deployment-protection
  # settings this config never sets explicitly. Without ignore_changes, Terraform
  # fills them with the provider's schema defaults and plans to overwrite whatever
  # is actually configured on the dashboard (it tried to flip OIDC tokens off and
  # loosen deployment protection the first time this was imported). Out of scope
  # for this config on purpose: manage them in the Vercel dashboard.
  lifecycle {
    ignore_changes = [oidc_token_config, vercel_authentication, protection_bypass_for_automation_secret]
  }
}

# Generic env vars from var.app_env_vars, one Vercel resource per
# (name, environment) pair so production and preview can hold different values.
resource "vercel_project_environment_variable" "app" {
  for_each = local.env_var_keys

  project_id = vercel_project.ghostmsg.id
  team_id    = var.vercel_team_id
  key        = split("::", each.value)[0]
  target     = [split("::", each.value)[1]]
  value      = var.app_env_vars[split("::", each.value)[0]][split("::", each.value)[1]]
  sensitive  = var.app_env_vars[split("::", each.value)[0]].sensitive
}

# MONGODB_URI is derived from the Atlas cluster + per-environment database
# user below, not from var.app_env_vars, so production and preview always
# point at their own database automatically.
resource "vercel_project_environment_variable" "mongodb_uri_production" {
  project_id = vercel_project.ghostmsg.id
  team_id    = var.vercel_team_id
  key        = "MONGODB_URI"
  target     = ["production"]
  sensitive  = true
  value      = "mongodb+srv://${mongodbatlas_database_user.production.username}:${urlencode(var.mongodbatlas_db_password_production)}@${local.mongo_srv_host}/${var.mongodbatlas_database_name}?retryWrites=true&w=majority"
}

resource "vercel_project_environment_variable" "mongodb_uri_preview" {
  project_id = vercel_project.ghostmsg.id
  team_id    = var.vercel_team_id
  key        = "MONGODB_URI"
  target     = ["preview"]
  sensitive  = true
  value      = "mongodb+srv://${mongodbatlas_database_user.preview.username}:${urlencode(var.mongodbatlas_db_password_preview)}@${local.mongo_srv_host}/${var.mongodbatlas_database_name}_preview?retryWrites=true&w=majority"
}
