locals {
  cluster_config = {
    name             = "polaris-testbed"
    num_worker_nodes = 2
  }

  k8ssandra_config = {
    cluster_name      = "polaris-k8ssandra-cluster"
    cluster_size      = 1
    storage           = 1
    enable_prometheus = true
    stargate_size     = 1
  }
}
