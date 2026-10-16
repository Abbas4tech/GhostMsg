locals {
  environments = ["production", "preview", "development"]

  # One entry per (env var name, environment) pair that actually has a value
  # set, e.g. "NEXTAUTH_URL::production". Only the name and environment are in
  # the key, never the value, which is what lets this be used for a resource's
  # for_each even though var.app_env_vars itself is marked sensitive.
  env_var_keys = nonsensitive(toset(flatten([
    for name, cfg in var.app_env_vars : [
      for env in local.environments : "${name}::${env}"
      if cfg[env] != null
    ]
  ])))

  # host part of the Atlas SRV connection string, e.g. "cluster0.abcde.mongodb.net"
  mongo_srv_host = replace(mongodbatlas_cluster.ghostmsg.srv_address, "mongodb+srv://", "")
}
