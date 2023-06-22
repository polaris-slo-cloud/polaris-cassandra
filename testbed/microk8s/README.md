# MicroK8s

To setup a MicroK8s cluster, first install MicroK8s on all machines you want to use as nodes:

```bash
sudo snap install microk8s --classic --channel=1.27
```

## Enabling feature gates

If you want to enable certain feature gates, you can add them to the kube-apiserver config as follows:

```bash
echo "--feature-gates='InPlacePodVerticalScaling=true'" | sudo tee -a /var/snap/microk8s/current/args/kube-apiserver
```

## Creating a multi-node cluster

First, ensure that the node which should become the control plane node, can resolve the hostname of the worker nodes to their respective IP addresses.
This can be done by specifying the worker nodes and their IP addresses in the `/etc/hosts` file.

To join the nodes together to form a multi node cluster, first run `microk8s add-node` on the designated control plane node. This command outputs another command which should be run on the worker node. Repeat this process for each worker node.

## Installing required addons

MicroK8s allows for easy installing of addons. For this project required addons are:

- rbac
- metrics-server
- observability
- cert-manager

The observability addon takes a helm `values.yaml` file. Copy the file to the control plane node and enable the addon with:

```bash
microk8s enable observability -f values.yaml
```

## Applying Terraform

To finish this setup up, the Terraform configuration has to be applied. This can be done by first initializing the folder by running:

```bash
terraform init
```

and subsequently applying the configuration by running:

```bash
terraform apply
```
