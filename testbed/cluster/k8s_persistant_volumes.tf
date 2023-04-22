resource "null_resource" "controle_plane_disk_folders" {
  count = local.cluster_config.num_control_plane_nodes

  provisioner "local-exec" {
    command = "rm -rf ${path.module}/disks/control_plane${count.index} && mkdir -p ${path.module}/disks/control_plane${count.index}/{disk01,disk02,disk03,disk04,disk05}"
  }
}

resource "null_resource" "worker_disk_folders" {
  count = local.cluster_config.num_control_plane_nodes

  provisioner "local-exec" {
    command = "rm -rf ${path.module}/disks/worker${count.index} && mkdir -p ${path.module}/disks/worker${count.index}/{disk01,disk02,disk03,disk04,disk05}"
  }
}

resource "kubectl_manifest" "local-storage" {
  yaml_body = file("files/local-storage.yaml")
}

resource "kubectl_manifest" "persistant_volumes" {
  for_each  = toset(data.kubectl_path_documents.persistant_volumes.documents)
  yaml_body = each.value
}
