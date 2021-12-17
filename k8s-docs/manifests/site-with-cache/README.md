# Web server and cache deployment with side-by-side location

This deployment configuration is used to deploy a simple web server which leverages redis for caching purposes to ameliorate performance.

In a two-node cluster, without any further restrictions, the scheduler would be free to schedule all redis instances on one node and the web server instances on another.
Ideally, however, there would be one redis instance per node with as many web servers as required next to it.
This preference can be expressed using affinity rules.

<sub>Taints and tolerations are not applicable here as the pods are the objects that are repelling each other.
The nodes do not impose any restriction on scheduling whatsoever.</sub>

If the nodes' utilization is low, the requested quotas should be adjusted.
Alternatively, it might prove useful to _soften_ the restrictions by using `preferredDuringSchedulingIgnoredDuringExecution` in place of `requiredDuringSchedulingIgnoredDuringExecution`, making it possible to schedule multiple instances side-by-side if the cluster does not have any nodes left on which the workloads could be scheduled instead.

Taken from the official [Kubernetes documentation](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node).
