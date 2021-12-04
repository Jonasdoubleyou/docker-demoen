# Deploying the application cluster to Azure

## Setting up an Azure sandbox environment

Microsoft provides free-of-charge access to Azure resources for the sake of completing trainings on Microsoft Learn.
Using the so-called Azure sandbox for other purposes may result in permanent account termination.

The instructions provided in this document are compliant with the instructions provided in [this](https://docs.microsoft.com/en-us/learn/modules/aks-deploy-container-app/3-exercise-create-aks-cluster) training on AKS.
An active (free, if no resources are allocated) Microsoft Azure subscription is required to enable the Azure sandbox.

## Step-by-step instructions

### Creating a resource group

```shell
export RESOURCE_GROUP=
export CLUSTER_NAME=dhbw-weather-app
```

```shell
az group create --location westeurope --resource-group dhbw-weather-group
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

Number of nodes in the Kubernetes node pool
`--enable-cluster-autoscaler` `--max-count` `--min-count`

_Notes:_

- List of valid locations can be obtained via `az account list-locations`.

  Alternatively, for a list sorted by location name:  
  `az account list-locations --query "sort_by([].{DisplayName:displayName, Name:name}, &DisplayName)" --output table`
  - The query parameter expects a [`JMESPath`](https://jmespath.org) query string, a standardized query language for JSON.
- _`SKU` is an Azure-specific abbreviation and stands for stock keeping unit._
  It is applied in all contexts where the options available on Azure are referenced, e.g. in the context of available operating systems (OS SKU).

### Adding a nodepool to an AKS cluster

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

### Linking the cluster with `kubectl`

```shell
az aks get-credentials --name $CLUSTER_NAME --resource-group $RESOURCE_GROUP
```

Adds an entry to the `~/.kube/config` file.


