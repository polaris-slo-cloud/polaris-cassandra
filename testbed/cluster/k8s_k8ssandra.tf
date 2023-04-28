resource "helm_release" "k8ssandra_operator" {
  name      = "k8ssandra-operator"
  chart     = "https://helm.k8ssandra.io/stable/k8ssandra-operator-1.6.0.tgz"
  namespace = lookup(kubernetes_namespace.this, "k8ssandra")["id"]

  depends_on = [
    helm_release.cert_manager
  ]
}

resource "kubectl_manifest" "k8ssandra_cluster" {
  yaml_body = templatefile("${path.module}/files/k8ssandra-cluster.yaml.tftpl", {
    config = merge(local.k8ssandra_config, {
      namespace = lookup(kubernetes_namespace.this, "k8ssandra")["id"]
    })
  })

  depends_on = [
    helm_release.k8ssandra_operator
  ]
}

resource "kubectl_manifest" "k8ssandra_grafana_dashboards" {
  for_each  = data.kubectl_path_documents.k8ssandra_grafana_dashboards.manifests
  yaml_body = each.value
}
