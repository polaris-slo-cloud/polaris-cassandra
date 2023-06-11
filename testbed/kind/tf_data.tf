data "kubectl_path_documents" "persistant_volumes" {
  pattern = "${path.module}/files/persistant-volumes.yaml.tftpl"

  vars = {
    cluster_name     = local.cluster_config.name,
    num_worker_nodes = length(local.cluster_config.worker_nodes)
  }
}
