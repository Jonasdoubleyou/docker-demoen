# Kubernetes Terminology

## How to read this document

Some chapters contain _Advanced_ sections containing far-reaching information on how some of the core principles of Kubernetes are put into practice.
It is not required for the full understanding of the core principles described in this document and may be skipped especially by readers who are not yet familiar with Kubernetes.

## Base terms

### Pods

A _pod_ is the smallest deployable compute unit that can be managed and created in a Kubernetes cluster.
It is composed of one or more containers, has an IP address and networking rules assigned to it, and is always assigned to exactly one node which must be determined at creation time and cannot be changed later on.

### Deployment

- Wrapper of pods into an intelligent object that allows them to scale
- Pod template with is associated with scaling and rollout polices
- Consists of one or more replica set, whereby one replica set represents usually one set of container image versions

A _deployment_ describes the desired state of a certain aspect of an application.
In mot cases, it embodies the information on how many pods with what kind of containers should be running and how those scaling goals are being reached.
It is thus often conceived as a thin layer around a container template providing additional metadata, providing precise information on the exact deployment.

TODO: Rephrase
In practice, pods are rarely created by manual means.

For this reason, the official Kubernetes documentation also refers to them as thin wrappers of pods into an intelligent object that allows them to scale.
It should, however, not mistakenly be deduced that a deployment requires a set of pods to start with.
A deployment's set of pod is rather created during its lifetime.

_**Advanced:** Under the hood, the creation of a deployment triggers the creation of a replica set which is responsible for scaling the application according to the scaling targets mandated by the scaling and rollout policies currently in place.
Decoupling the concept of deployments and the unit that is responsible for actually scaling the application facilitates advanced operations such as rolling releases.
A rolling update thus boils down to the creation of a new replica set with a set of new image versions and the decommission of the old one, whereby the target quotas are continuously adjusted by the deployment-managed policies._

_A replica set does not necessarily belong to a deployment, though.
This gives room for extensions and other concepts that might be abstracted in a similar manner._

_**Advanced:** It is possible to create pods that neither belong to a deployment nor to a replica set (which are, in turn, not necessarily related to deployments) which are referred to as "naked pods".
Whilst possible, it is not recommended to create them as they will not be rescheduled in case of failure._

### Namespaces

A _namespace_ is an abstraction used by Kubernetes to support multiple virtual clusters on the same physical cluster.

_**Advanced:** By default, 4 namespaces are active on vanilla Kubernetes installations:_

- _default: Namespace in which user workloads are managed._
- _kube-node-lease: Helper namespaces in which the lease objects for the nodes are managed.
  A lease object can be understood as a lightweight `NodeStatus` object which serves the single purpose of keeping track of the node's heartbeat
  Sending entire `NodeStatus` objects across the wire has been [deemed wasteful](https://github.com/kubernetes/enhancements/blob/9e5e92ec0a693f114a687f05c909ec3d0ca1ea0a/keps/sig-node/589-efficient-node-heartbeats/kep.yaml)._
- _kube-node-public: Namespace readable by all users._
- _kube-system: Namespace for all objects created by the system and necessary for operating the cluster._
  - _coredns (DNS server, primarily used in conjunction with server)_
  - _etcd (strongly consistent, distributed key-value store used to store the cluster's status)_
  - _kube-apiserver_
  - _kube-controller-manager_
  - _kube-scheduler_
  - _storage-provisioner_

### Manifest files

With kubectl and manifest files, Kubernetes offers two ways of creating new objects (such as pods, deployments, or ingresses) in the cluster.
Whilst kubectl offers a direct way of control over the cluster for cluster administrators, developers, and other stakeholders regularly interacting with the cluster, manifest files provide a simple, declarative means to reproduce the creation of cluster objects.

It is strongly recommended to use manifest files for all sort of objects that are required for the application's intended execution.
Ideally, those files are stored in the same repository as the application's code itself as they declare the application's environment and constitute thus an integral part of its correct behavior.

### Cluster nodes

With control plane nodes and worker nodes, Kubernetes clusters differentiate between two types of nodes which schedule different kinds of workloads.
Whilst the latter constitute those nodes that workload containers are scheduled to, the prior execute all containers that are required for the cluster's correct operation; effectively hosting the services required for controlling the cluster.
The ensemble of those services constitute the so-called control plane.

Control plane nodes can also execute workload containers, even though it is not recommended as it might affect the cluster's stability.
The inverse (worker nodes executing control plane workloads), however, does never hold true.

_**Advanced:** Services that typically make up the control plane (by context they are associated with):_

- _default_
- _kube-node-lease_
- Kubernetes differentiates between two types of nodes
  - Control plane nodes
    - Hosting cluster's control pane and thus services controlling the cluster
    - Providing the API used by all other nodes to communicate
    - (workload) containers are never scheduled to control plane nodes
  - Nodes
    - Nodes the (workload) containers are scheduled to

### Node pools

- "a configuration to create multiple node types in the same cluster" (-> vm size and operating system)
- at runtime: logical set of actual node/vm instances
- Azure: two types (user and system).
  At least one system node pool for critical services which can also host user applications and workloads

### Labels

A list of all built-in/well-known labels can be found [here](https://kubernetes.io/docs/reference/labels-annotations-taints/).

## Controller & control loop

### Ingress controllers

- Controller/Control loop within the Kubernetes environment that handles the creation of newly created ingress points, e.g. by creating new DNS entries in the DNS zone provided by the hyperscaler and/or by configuring an existing load balancer accordingly

## Cluster architectures

- Single control plane, single node
  - Often used in development environments
  - Unsuitable for production environments due to insufficient resiliency of the control plane and nodes
- Single control plane, multiple nodes
  - Common, but only semi-resilient architecture pattern
  - Can react to node failures, but not to the failure of the control plane itself
  - If control plane fails, no interaction with the cluster is possible, including for operators

## Autoscaling Kubernetes clusters in cloud environments

### Horizontal pod autoscaling

- Scales pods/workload replicas in response to increased processor and memory utilization metrics on already-running pods of the same type
- Information is retrieved every 30 seconds from the Kubernetes Metrics Server using the Metrics api.

### Cluster autoscaling

- Scales the amount of nodes in a node pool
- Scaling decisions are based on the cluster's ability to schedule any more pods on the already existing nodes.
- The use of a cluster autoscaler inhibits scaling a node pools' node count down to zero.

## Assigning specific workloads to fitting nodes

Under some circumstances, it can be of great value if certain workloads are scheduled to nodes with specialized capabilities and/or properties.
Possible use cases are (list is not exhaustive):

- **Hardware-accelerated computing:** Nodes equipped with specialized computing units, e.g. for machine learning purposes (tensor processing units, graphics processing units) or graphics workloads (graphics processing unit) should ideally only execute workloads can make use of the extended hardware capabilities, especially in cloud environments.
  Even if the user is not charged on a per-use basis, regular workloads might block those nodes from suitable workloads.
- **Availability constraints:** Certain node configurations might have different availability characteristics than others.

  In self-hosted/on-premise environments, some nodes might be better secured against electricity outages or connectivity losses by installing UPSs (uninterruptable power supply) and redundant hardware components.
  Workloads that are critical for the entire system can thus be scheduled to more fail-proof machines.
  
  In cloud environments, the deviating characteristics might also be imposed by the billing model, such as with Azure's and AWS' spot instances.
  Spot instances are instances of temporary availability at remarkable discounts.
  Their availability is based on the data centers general utilization, so that end users are incentivized to request resources when the data center is not under optimal utilization.
- **User/Tenant-assigned nodes:** Application tenants might request that their data is stored and processed on distinct nodes that serve no other purpose.
  This obligation might also be imposed by old service level agreements that the solution provider has still to hold up to.

- label selector: nodes with certain isolation, security, or regulatory properties
Using `NodeRestriction` admission plugin can prevent kubelets from modifying certain labels, such as those used for scheduling the workloads.

Those use cases do, however, not share the implications the respective requirements would have on scheduling.
Whereas scheduling critical workloads on more fail-proof is to be understood as a preference rather than as a strict requirement, disregarding those agreements might end up in contract violation and thus legal issues.
This disparity resulted in the introduction of two distinct concepts: tolerations and taints, and affinity.
The concepts of taints, tolerations and affinity do not only give end users control on where to schedule a workload, but also allows some other new concepts that are handled on the same abstraction level, such as the toleration of network failure.

| concept | node | pod | effect |
| --- | --- | --- | --- |
| label selector | labels | `nodeSelector` | pods repel incompatible pods |
| affinity | labels | affinity & anti-affinity (based on labels) | pods prefer/dislike matching pods |
| taint & toleration | taint | toleration | nodes repel incompatible pods, nodes dislike incompatible pods |

### Label selector

Label selectors allow to confine scheduling in that pods with this selector can only be scheduled on nodes that match the specified labels.
In the following example, a `disktype` label exists to indicate what type of persistent storage a node has been equipped with.
The to-be-defined pod should only be scheduled on nodes that dispose of ssds.

```yml
apiVersion: v1
kind: Pod
metadata:
  # 'name' and 'labels'
spec:
  # 'containers'
  nodeSelector:
    disktype: ssd
```

The pod will no longer be scheduled on any node not fulfilling this criterion.

### Affinity

Affinity is similar to the concept of label selectors, but richer in expressiveness.

First, whenever multiple labels have been defined in a label selector, all labels have to be matched so that the entire condition is met.
  The affinity language enables the expression of more complicated relations between labels, using logical `Or`, `And`, `Lt`, `Gt`, `Exists`, `DoesNotExists`, `In`, and `NotIn` operators.
  Furthermore, the mere existence of a label can be queried.
Second, labels can not only be matched against node labels, but also against the labels of other pods in the same topological domain (such as a node, a rack, a cloud provider zone, a cloud provider region, etc).

As this expressiveness comes at the cost of conciseness and runtime overhead, label selectors are unlikely to be superseded by affinity expressions.
Also, those two features are not mutually exclusive.
Whenever both, affinity rules and a label selector are given, both have to match for the pod to be scheduled onto a node.

Another key difference consists in the consequences a mismatch has.
In contrast to label selectors, affinity rules might also be declared as _soft_, meaning that not matching them expresses only a tendency against being scheduled on nodes in the respective topological domain.
It can also be specified whether those restrictions should also be enforced for already running pods, letting Kubernetes reschedule them in case of any restriction violation.

For more information on node affinity, refer to the [official documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node).

### Taints and tolerations

Taints (declared on nodes) and tolerations (declared on pods) are properties that allow to declare restrictions on which pods (i.e., pods) can be scheduled on a given set of nodes.
Pods that are not matching the restrictions declared on a node are - depending on the _effect_ defined by the restriction - either not scheduled to the node or are just more unlikely to be scheduled on them.

This is contrary to the concept of affinity (declared on pods) which is only used to prioritize a set of nodes over another for specific workloads; it is thus expressing nothing more than a preference rather than a strict requirement.

A taint is a property of a node and repels/rejects per se all pods that are not _tolerating_ that taint.
For a better utilization of available resources, the effect of unmatching tolerations and taints can be softened so that they represent nothing more than a scheduling preference.
In total, there are three effects that can be applied to taints:

| effect name | description |
| --- | --- |
| `NoSchedule` | No new pod not tolerating the taint will be scheduled to the node. Already running pods are allowed to continue execution. |
| `PreferNoSchedule` | No new pod not tolerating the taint _should_ be scheduled to the node, but it is per se not forbidden. As it only expresses a preference, it is similar to the concept of anti-affinity. |
| `NoExecute` | No new pod not tolerating the taint will be scheduled to the node. Already running pods are evicted. The specific conditions of eviction are declared by further, optional properties. Most importantly, a toleration's property `tolerationSeconds` defines for how long a taint is tolerated which is particularly useful in conjunction with Kubernetes' built-in taints. |

| built-in taints (taint nodes by condition) | description |
| --- | --- |
| `node.kubernetes.io/not-ready` | The node's `NodeCondition` `Ready` is false (node is not ready). |
| `node.kubernetes.io/unreachable` | The node's `NodeCondition` `Ready` is unknown (node cannot be reached from the node controller). |
| `node.kubernetes.io/memory-pressure` | |
| `node.kubernetes.io/disk-pressure` | |
| `node.kubernetes.io/pid-pressure` | |
| `node.kubernetes.io/network-unavailable` | |
| `node.kubernetes.io/unschedulable` | Nodes are marked as unschedulable by the `kubectl cordon` command. Internally, it is applying this taint to the node. |
| `node.cloudprovider.kubernetes.io/uninitialized` | Usually used in conjunction with hyperscaler-managed kubelets which are backed by the hyperscaler's compute services (i.e., regular hyperscaler vm provisioning services). The taint is removed as soon as the hyperscaler's controller is ready. |

A list of all built-in/well-known taints can be found [here](https://kubernetes.io/docs/reference/labels-annotations-taints/).

Kubernetes is applying those taints automatically as soon as their respective criteria is met to avoid the scheduling of further workloads to that node.
The kubelet which is also in charge of monitoring the resources might also decide to perform _node-pressure eviction_, i.e., to fail proactively a set of pods to liberate scarce resources such as memory or cpu time.
The kubelet does so by setting the pods' `PodPhase` to `Failed`.

For certain types of applications, tolerating those taints for a limited amount of time could prove useful.
A long-running batch processing application (high volumes of locate state), for instance, might want to tolerate network unavailability/partition for certain minutes to avoid premature pod eviction.
Daemon sets make use of tolerations for `node.kubernetes.io/unreachable` and `node.kubernetes.io/not-ready` so that they are never evicted, even if the node is under pressure and/or the kubelet terminates.
For normal pods, those tolerations are set with a value of `tolerationSeconds` of `300`.

Hyperscalers might decide to expose custom taints to indicate certain properties of nodes and differences between nodes, especially with regards to the nodes' billing models.
In AKS (Azure Kubernetes Service), for instance, the `` taint indicates that the given instances are spot instances and might thus be terminated after 30 seconds after having notified the application.

## Eviction signals of node-pressure eviction


