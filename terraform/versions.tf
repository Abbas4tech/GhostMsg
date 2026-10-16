terraform {
  required_version = ">= 1.7.0"

  cloud {
    organization = "PersonalAbbasSpace"

    workspaces {
      name = "ghostmsg"
    }
  }

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.4"
    }
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "~> 1.18"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_id
}

provider "mongodbatlas" {
  public_key  = var.mongodbatlas_public_key
  private_key = var.mongodbatlas_private_key
}
