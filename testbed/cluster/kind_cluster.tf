resource "kind_cluster" "this" {
  name           = local.cluster_config.name
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

   node {
    role = "control_plane"

    extra_mounts {
      host_path      = "${path.module}/disks/control_plane/"
      container_path = "/polaris-disks"
    }

    kubeadm_config_patches = [
      "kind: InitConfiguration\nnodeRegistration:\n  kubeletExtraArgs:\n    node-labels: \"ingress-ready=true\"\n"
    ]

    extra_port_mappings {
      container_port = 80
      host_port = 8080
    }

    extra_port_mappings {
      container_port = 443
      host_port = 8443
    }
  }

    dynamic "node" {
      for_each = range(local.cluster_config.num_worker_nodes)

      content {
        role = "worker"

        extra_mounts {
          host_path      = "${path.module}/disks/worker${node.key}/"
          container_path = "/polaris-disks"
        }
      }
    }
  }
}
