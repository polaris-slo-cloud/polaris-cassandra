locals {
  namespaces = [
    "k8ssandra",
    "monitoring",
  ]

  k8ssandra_config = {
    cluster_name           = "polaris-k8ssandra-cluster"
    cluster_size           = 1
    storage                = 3
    soft_pod_anti_affinity = true
    enable_prometheus      = true
    stargate_size          = 0
    resources = {
      cpu    = "500m"
      memory = "6000Mi"
    }
  }
}
