terraform {
  required_version = "~> 1.4.0"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20.0"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.14.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.9.0"
    }
  }

  backend "kubernetes" {
    secret_suffix  = "tfstate"
    config_path    = "~/.kube/config"
    config_context = "microk8s"
  }
}
