data "kubectl_path_documents" "persistant_volumes" {
  pattern = "${path.module}/files/persistant-volumes.yaml.tftpl"

  vars = {
    cluster_name     = local.cluster_config.name,
    num_worker_nodes = local.cluster_config.num_worker_nodes
  }
}

data "kubectl_path_documents" "k8ssandra_grafana_dashboards" {
  pattern = "${path.module}/files/k8ssandra-grafana-dashboards.yaml.tftpl"

  vars = {
    namespace = kubernetes_namespace.monitoring.metadata.0.name
  }
}
