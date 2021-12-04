# Kubernetes Terminology

## Base terms

### Pods

- Logical unit of a set of containers/Composed of one or more containers
- Each pod has an ip address, networking rules and exposed pods

### Deployment

- Wrapper of pods into an intelligent object that allows them to scale
- Pod template with is associated with scaling and rollout polices
- Consists of one or more replica set, whereby one replica set represents usually one set of container image versions

### Manifest files

- Description of Kubernetes objects

### Cluster nodes

- Kubernetes differentiates between two types of nodes
  - Control plane nodes
    - Hosting cluster's control pane and thus services controlling the cluster
    - Providing the API used by all other nodes to communicate
    - (workload) containers are never scheduled to control plane nodes
  - Nodes
    - Nodes the (workload) containers are scheduled to

### Ingress controllers

- Controller/Control loop within the Kubernetes environment that handles the creation of newly created ingress points, e.g. by creating new DNS entries in the DNS zone provided by the hyperscaler and/or by configuring an existing load balancer accordingly

### Node pools

- "a configuration to create multiple node types in the same cluster" (-> vm size and operating system)
- at runtime: logical set of actual node/vm instances
- Azure: two types (user and system). 
  At least one system node pool for critical services which can also host user applications and workloads

## Cluster architectures

- Single control plane, single node
  - Often used in development environments
  - Unsuitable for production environments due to insufficient resiliency of the control plane and nodes
- Single control plane, multiple nodes
  - Common, but only semi-resilient architecture pattern
  - Can react to node failures, but not to the failure of the control plane itself
  - If control plane fails, no interaction with the cluster is possible, including for operators
