# ------------------------------------------------------------------------------
# Vercel
# ------------------------------------------------------------------------------

variable "vercel_api_token" {
  description = "Vercel API token (Account Settings → Tokens). Set as a sensitive workspace variable."
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel team/org id that owns the project (.vercel/project.json → orgId)."
  type        = string
  default     = "team_sujhNMhXfFKvroQkhJA7BBaZ"
}

variable "vercel_project_name" {
  description = "Vercel project name (.vercel/project.json → projectName)."
  type        = string
  default     = "ghost-msg"
}

variable "github_repo" {
  description = "owner/repo that the Vercel project deploys from, for the Git integration link."
  type        = string
  default     = "Abbas4tech/GhostMsg"
}

# ------------------------------------------------------------------------------
# MongoDB Atlas
# ------------------------------------------------------------------------------

variable "mongodbatlas_public_key" {
  description = "Atlas API public key (Organization Settings → Access Manager → API Keys)."
  type        = string
  sensitive   = true
}

variable "mongodbatlas_private_key" {
  description = "Atlas API private key."
  type        = string
  sensitive   = true
}

variable "mongodbatlas_org_id" {
  description = "Atlas organization id that the project is created under."
  type        = string
}

variable "mongodbatlas_project_name" {
  description = <<-EOT
    Atlas project (group) name. Defaults to the existing project's real name
    ("Project 0", id 670cc22371b1856baf945a9d) so the first import is a
    no-op. Can't be "GhostMsg": a *different*, unrelated project in the same
    org already has that name (id 6ad215632c5f48216a492c03, cluster
    "ghostmsg" on ghostmsg.hed35w5.mongodb.net). Atlas project names must be
    unique per org. Rename this one later if you want (safe, non-destructive)
    once you've confirmed the import.
  EOT
  type        = string
  default     = "Project 0"
}

variable "mongodbatlas_cluster_name" {
  description = "Atlas cluster name. Matches the database host segment in MONGODB_URI (abbas-shaikh.u0qnz.mongodb.net)."
  type        = string
  default     = "Abbas-Shaikh"
}

variable "mongodbatlas_cloud_provider" {
  description = "Backing cloud provider for the free/shared tier (AWS, GCP, or AZURE)."
  type        = string
  default     = "AWS"
}

variable "mongodbatlas_region" {
  description = "Atlas region name. Matches the existing Abbas-Shaikh cluster's real region: changing it on an M0 cluster can force a destroy/recreate, so don't edit this without checking the Atlas UI first."
  type        = string
  default     = "AP_SOUTH_1"
}

variable "mongodbatlas_instance_size" {
  description = "Atlas tier: M0 (free), M2/M5 (shared), or a dedicated size like M10+. M10+ needs mongodbatlas_advanced_cluster instead; see README."
  type        = string
  default     = "M0"
}

variable "mongodbatlas_database_name" {
  description = "Base database name, matching the existing production data (MONGODB_URI's path). Production uses this name as-is; preview uses \"<this>_preview\" so the two never share data."
  type        = string
  default     = "honest_feedback"
}

variable "mongodbatlas_db_username" {
  description = "Base username for the app's database users. Production becomes \"<this>-production\", preview becomes \"<this>-preview\"."
  type        = string
  default     = "ghostmsg-app"
}

variable "mongodbatlas_db_password_production" {
  description = "Password for the production database user. Set as a sensitive workspace variable, never in a committed file."
  type        = string
  sensitive   = true
}

variable "mongodbatlas_db_password_preview" {
  description = "Password for the preview database user. Set as a sensitive workspace variable, never in a committed file."
  type        = string
  sensitive   = true
}

variable "mongodbatlas_ip_access_list" {
  description = <<-EOT
    CIDR blocks allowed to reach the cluster. Vercel serverless functions use dynamic
    egress IPs, so the practical choices are 0.0.0.0/0 (open, relies on the DB user's
    credentials and TLS for security) or Atlas's PrivateLink/Vercel integration
    (no Terraform resource yet for the Vercel side of that).
  EOT
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

# ------------------------------------------------------------------------------
# Application environment variables (synced to the Vercel project)
# ------------------------------------------------------------------------------
# Mirrors .env.example, minus MONGODB_URI (built separately in mongodbatlas.tf
# + vercel.tf from the Atlas resources below, one per environment). Supply real
# values via terraform.tfvars (gitignored) or, for the cloud workspace, as a
# single sensitive HCL-typed workspace variable.
#
# Each entry can set `production`, `preview` and/or `development` to different
# values, or leave any of them out (null) to skip creating that env var in that
# environment entirely. Leave a key out of the whole map to skip it everywhere.

variable "app_env_vars" {
  description = "Vercel environment variables, keyed by env var name, with one value per environment."
  type = map(object({
    production  = optional(string)
    preview     = optional(string)
    development = optional(string)
    sensitive   = optional(bool, true)
  }))
  default   = {}
  sensitive = true
}
