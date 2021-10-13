terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "AmitSuncorp"
    workspaces {
      name = "hashicat-aws"
    }
  }
}
