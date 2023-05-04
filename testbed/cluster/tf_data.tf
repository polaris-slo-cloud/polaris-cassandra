data "kubectl_path_documents" "persistant_volumes" {
  pattern = "${path.module}/files/persistant-volumes.yaml.tftpl"

  vars = {
    cluster_name     = local.cluster_config.name,
    num_worker_nodes = length(local.cluster_config.worker_nodes)
  }
}

data "http" "nginx_ingress_manifest" {
  url = "https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml"
}

data "kubectl_file_documents" "nginx_ingress" {
  content = data.http.nginx_ingress_manifest.response_body
}
