resource "helm_release" "k8ssandra_operator" {
  name       = "k8ssandra-operator"
  repository = "https://helm.k8ssandra.io/stable"
  chart      = "k8ssandra-operator"
  namespace  = lookup(kubernetes_namespace.this, "k8ssandra")["id"]

  set {
    name  = "cass-operator.admissionWebhooks.enabled"
    value = "false"
  }
}

resource "kubectl_manifest" "k8ssandra_cluster" {
  yaml_body = templatefile("${path.module}/files/k8ssandra-cluster.yaml.tftpl", {
    config = merge(local.k8ssandra_config, {
      namespace = lookup(kubernetes_namespace.this, "k8ssandra")["id"]
    })
  })

  ignore_fields = [
    "spec.cassandra.resources",
    "spec.cassandra.datacenters.0.size"
  ]

  depends_on = [
    helm_release.k8ssandra_operator
  ]
}

resource "kubectl_manifest" "k8ssandra_grafana_overview_dashboard" {
  yaml_body = templatefile("${path.module}/files/k8ssandra-grafana-overview-dashboard.yaml.tftpl", {
    namespace = lookup(kubernetes_namespace.this, "k8ssandra")["id"]
  })
}

resource "kubectl_manifest" "k8ssandra_grafana_condensed_dashboard" {
  yaml_body = templatefile("${path.module}/files/k8ssandra-grafana-condensed-dashboard.yaml.tftpl", {
    namespace = lookup(kubernetes_namespace.this, "k8ssandra")["id"]
  })
}
