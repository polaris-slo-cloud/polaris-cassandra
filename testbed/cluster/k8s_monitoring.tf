resource "helm_release" "metrics_server" {
  name       = "metrics-server"
  repository = "https://kubernetes-sigs.github.io/metrics-server"
  chart      = "metrics-server"
  version    = "3.10.0"
  namespace  = "kube-system"

  set {
    name  = "args"
    value = "{--kubelet-insecure-tls}"
  }
}

resource "helm_release" "kube_prometheus_stack" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "45.19.0"
  namespace  = lookup(kubernetes_namespace.this, "monitoring")["id"]
  values     = [file("files/helm/kube-prometheus-stack/values.yaml")]

  values = [file("files/helm/kube-prometheus-stack/values.yaml")]
}
