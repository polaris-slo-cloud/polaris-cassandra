locals {
  namespaces = [
    "k8ssandra",
  ]

  k8ssandra_config = {
    cluster_name           = "polaris-k8ssandra-cluster"
    cluster_size           = 1
    storage                = 3
    soft_pod_anti_affinity = true
    enable_prometheus      = true
    stargate_size          = 0
    resources = {
      requests = {
        cpu    = 1
        memory = "1G"
      }
      limits = {
        cpu    = 2
        memory = "4G"
      }
    }
  }
}
