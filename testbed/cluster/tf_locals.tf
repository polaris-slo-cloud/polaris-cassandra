locals {
  cluster_config = {
    name = "polaris-testbed"
    worker_nodes = [
      {
        extra_port_mappings = [
          {
            container_port = 9090
            host_port      = 9090
          },
        ]
      },
      {
        extra_port_mappings = []
      }
    ],
    image = "kindest/node:v1.27.1@sha256:9915f5629ef4d29f35b478e819249e89cfaffcbfeebda4324e5c01d53d937b09"
  }

  namespaces = [
    "monitoring",
    "cert-manager",
    "k8ssandra",
    "ingress-nginx",
  ]

  k8ssandra_config = {
    cluster_name           = "polaris-k8ssandra-cluster"
    cluster_size           = 1
    storage                = 1
    soft_pod_anti_affinity = true
    enable_prometheus      = true
    stargate_size          = 1
  }
}
