resource "helm_release" "cert_manager" {
  name       = "cert-manager"
  repository = "https://charts.jetstack.io/"
  chart      = "cert-manager"
  version    = "v1.11.0"
  namespace  = lookup(kubernetes_namespace.this, "cert-manager")["id"]


  set {
    name  = "installCRDs"
    value = "true"
  }
}
