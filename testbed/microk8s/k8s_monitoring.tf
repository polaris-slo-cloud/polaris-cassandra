resource "helm_release" "kube_prometheus_stack" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "47.0.0"
  namespace  = lookup(kubernetes_namespace.this, "monitoring")["id"]
  values     = [file("files/helm/kube-prometheus-stack/values.yaml")]
}
