# If a project/cluster already backs the current MONGODB_URI, import them before
# the first apply instead of letting Terraform create new ones:
#   terraform import mongodbatlas_project.ghostmsg <existing-project-id>
#   terraform import mongodbatlas_cluster.ghostmsg <project-id>-<cluster-name>
resource "mongodbatlas_project" "ghostmsg" {
  name   = var.mongodbatlas_project_name
  org_id = var.mongodbatlas_org_id
}

# M0/M2/M5 (shared tiers) only. For a dedicated tier (M10+), switch this to
# mongodbatlas_advanced_cluster with a replication_specs block instead.
resource "mongodbatlas_cluster" "ghostmsg" {
  project_id = mongodbatlas_project.ghostmsg.id
  name       = var.mongodbatlas_cluster_name

  provider_name               = "TENANT"
  backing_provider_name       = var.mongodbatlas_cloud_provider
  provider_region_name        = var.mongodbatlas_region
  provider_instance_size_name = var.mongodbatlas_instance_size

  # Matches the real Abbas-Shaikh cluster's current version. Changing a
  # running cluster's major version is a real upgrade, not something to
  # drift into via a default: bump this deliberately, not by accident.
  mongo_db_major_version = "8.0"
}

# Two database users on the one free cluster, each scoped read/write to its
# own database, so preview deployments never touch production data (and vice
# versa). MONGODB_URI for each environment is built from these in vercel.tf.
resource "mongodbatlas_database_user" "production" {
  project_id         = mongodbatlas_project.ghostmsg.id
  username           = "${var.mongodbatlas_db_username}-production"
  password           = var.mongodbatlas_db_password_production
  auth_database_name = "admin"

  roles {
    role_name     = "readWrite"
    database_name = var.mongodbatlas_database_name
  }
}

resource "mongodbatlas_database_user" "preview" {
  project_id         = mongodbatlas_project.ghostmsg.id
  username           = "${var.mongodbatlas_db_username}-preview"
  password           = var.mongodbatlas_db_password_preview
  auth_database_name = "admin"

  roles {
    role_name     = "readWrite"
    database_name = "${var.mongodbatlas_database_name}_preview"
  }
}

resource "mongodbatlas_project_ip_access_list" "allowed" {
  for_each = toset(var.mongodbatlas_ip_access_list)

  project_id = mongodbatlas_project.ghostmsg.id
  cidr_block = each.value
  comment    = "Managed by Terraform. Vercel serverless functions use dynamic egress IPs"
}
