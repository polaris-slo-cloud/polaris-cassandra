data "kubectl_path_documents" "persistant_volumes" {
  pattern = "files/persistant-volumes.yaml.tftpl"

  vars = {
    cluster_name            = local.cluster_config.name,
    num_control_plane_nodes = local.cluster_config.num_control_plane_nodes,
    num_worker_nodes        = local.cluster_config.num_worker_nodes
  }
}
