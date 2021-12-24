# Deploying the application cluster to Azure

## Setting up an Azure sandbox environment

Microsoft provides free-of-charge access to Azure resources for the sake of completing trainings on Microsoft Learn.
Using the so-called Azure sandbox for other purposes may result in permanent account termination.

The instructions provided in this document are compliant with the instructions provided in [this](https://docs.microsoft.com/en-us/learn/modules/aks-deploy-container-app/3-exercise-create-aks-cluster) training on AKS.
An active (free, if no resources are allocated) Microsoft Azure subscription is required to enable the Azure sandbox.

## Tricks

### Determine the latest, non-preview version of Kubernetes

```shell
az aks get-versions --location westeurope --query 'orchestrators[?!isPreview] | [-1].orchestratorVersion' --output tsv
```

_The JMESPath query can be separated into two expressions split by the pipe symbol, whereby the result of the first expression is piped into the second.
The result of the first expression is an array listing all available versions of Kubernetes along with some flags.
The expression in brackets requires that the `isPreview` property is not set, whereby the question mark denotes a conditional expression and the exclamation mark a negation.
The second expression is taking those and returns the array's last entry._

### Deploying to AKS spot node pools

- AKS spot node pools offer two eviction policies to choose from
  - `Delete`, implying that all resources of the instance in question will be deleted after its eviction
  - `Deallocate`, indicating that the disk's current state will be saved and allocated to a future instance.
    In this case, the subscription continues to be charged for disk usage.
    The vCPU is furthermore subtracted from the subscription's vCPU quota.
- Allows configuration of a maximum price (in USD/h) with a precision of up to 5 decimal places.
  If the maximum price is higher than the price of a standard instance, standard on-demand instances may be requested as well.
  In all other cases, the vm is evicted as soon as the spot instance's price surpasses the price limit.

## Step-by-step instructions

### Creating a resource group

```shell
export RESOURCE_GROUP=dhbw-weather-group
export CLUSTER_NAME=dhbw-weather-app
```

```shell
az group create --location westeurope --resource-group $RESOURCE_GROUP
```

### Creating an AKS (Azure Kubernetes Services) cluster

Single control plane, single node cluster architecture.
To keep cluster's cost low which sole purpose consists in serving as an example, the cheapest AKS-compatible vm type will be used.
For the same reasons at the expense of resiliency, only a single node will be put in place.

```shell
az aks create \
    --resource-group $RESOURCE_GROUP \
    --name $CLUSTER_NAME \
    --location westeurope
    --node-count 1 \
#    --generate-ssh-keys \
    --node-vm-size Standard_B2s \
    --tags "app=dhbw-weather" "component=cluster"
```

`--kubernetes-version`
`--enable-addons http_application_routing`
`--load-balancer-sku standard` (default value `basic` is not compatible with load balancing across multiple node pools)
`--vm-set-type VirtualMachineScaleSets` (virtual machine scale sets are required for AKS autoscaling services, presumably only for cluster autoscaling)

Number of nodes in the Kubernetes node pool
`--enable-cluster-autoscaler` `--max-count` `--min-count`

_Notes:_

- List of valid locations can be obtained via `az account list-locations`.

  Alternatively, for a list sorted by location name:  
  `az account list-locations --query "sort_by([].{DisplayName:displayName, Name:name}, &DisplayName)" --output table`
  - The query parameter expects a [`JMESPath` (JSON Matching Expression paths)](https://jmespath.org) query string, a standardized query language for JSON.
- _`SKU` is an Azure-specific abbreviation and stands for stock keeping unit._
  It is applied in all contexts where the options available on Azure are referenced, e.g. in the context of available operating systems (OS SKU).

### Adding a node pool to an AKS cluster

```shell
az aks nodepool add \
    --resource-group $RESOURCE_GROUP \
    --cluster-name $CLUSTER_NAME \
    --name userpool
    --node-count 1
    --node-vm-size Standard_B2s
```

Provisions an additional node pool that can be used to host applications and workloads outside of the system pool that has been created in the first step.

### Attaching an Azure Container Registry to the cluster

`az aks update --resource-group dhbw-weather-group --name dhbw-weather-cluster --attach-acr dhbwreg`

### Scaling a node pool

```shell
az aks nodepool scale \
    --resource-group $RESOURCE_GROUP \
    --cluster-name $CLUSTER_NAME \
    --name userpool \
    --node-count 0
```

### Linking the cluster with `kubectl`

```shell
az aks get-credentials --name $CLUSTER_NAME --resource-group $RESOURCE_GROUP
```

Adds an entry to the `~/.kube/config` file.
