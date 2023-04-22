locals {
  cluster_config = {
    name                    = "polaris-testbed"
    num_control_plane_nodes = 1
    num_worker_nodes        = 1
  }
}
