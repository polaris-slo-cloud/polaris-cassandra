terraform {
  required_version = "~> 1"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2"
    }
  }

  backend "kubernetes" {
    secret_suffix  = "tfstate"
    config_path    = "~/.kube/config"
    config_context = "microk8s"
  }
}
