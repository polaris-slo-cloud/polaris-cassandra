resource "helm_release" "ingress_nginx" {
  name       = "ingress-nginx"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  version    = "4.6.1"
  namespace  = lookup(kubernetes_namespace.this, "ingress-nginx")["id"]
  values     = [file("files/helm/ingress-nginx/values.yaml")]
}
