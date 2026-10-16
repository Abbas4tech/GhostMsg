output "vercel_project_id" {
  value = vercel_project.ghostmsg.id
}

output "vercel_production_url" {
  value = "https://${var.vercel_project_name}.vercel.app"
}

output "mongodbatlas_project_id" {
  value = mongodbatlas_project.ghostmsg.id
}

output "mongodbatlas_production_username" {
  value = mongodbatlas_database_user.production.username
}

output "mongodbatlas_preview_username" {
  value = mongodbatlas_database_user.preview.username
}

output "mongodbatlas_srv_host" {
  description = "Host part of the Atlas SRV address, e.g. cluster0.abcde.mongodb.net"
  value       = local.mongo_srv_host
}
