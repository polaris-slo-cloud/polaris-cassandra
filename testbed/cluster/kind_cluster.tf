resource "kind_cluster" "this" {
  name           = local.cluster_config.name
  wait_for_ready = true

  node_image = try(local.cluster_config.image, null)

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
        host_port      = 8080
      }

      extra_port_mappings {
        container_port = 443
        host_port      = 8443
      }
    }

    dynamic "node" {
      for_each = { for index, node in local.cluster_config.worker_nodes: index => node }

      content {
        role = "worker"

        extra_mounts {
          host_path      = "${path.module}/disks/worker${node.key}/"
          container_path = "/polaris-disks"
        }

        dynamic "extra_port_mappings" {
          for_each = { for index, port_mapping in node.value.extra_port_mappings: index => port_mapping }

          content {
            container_port = extra_port_mappings.value.container_port
            host_port = extra_port_mappings.value.host_port
          }
        }
      }
    }
  }

  depends_on = [
    null_resource.controle_plane_disk_folders,
    null_resource.worker_disk_folders
  ]
}
