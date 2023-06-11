resource "null_resource" "controle_plane_disk_folders" {
  provisioner "local-exec" {
    command = "rm -rf ${path.module}/disks/control_plane && mkdir -p ${path.module}/disks/control_plane/{disk01,disk02,disk03,disk04,disk05}"
  }
}

resource "null_resource" "worker_disk_folders" {
  count = length(local.cluster_config.worker_nodes)

  provisioner "local-exec" {
    command = "rm -rf ${path.module}/disks/worker${count.index} && mkdir -p ${path.module}/disks/worker${count.index}/{disk01,disk02,disk03,disk04,disk05}"
  }
}

resource "kubectl_manifest" "local-storage" {
  yaml_body = file("${path.module}/files/local-storage.yaml")
}

resource "kubectl_manifest" "persistant_volumes" {
  for_each  = toset(data.kubectl_path_documents.persistant_volumes.documents)
  yaml_body = each.value
}
