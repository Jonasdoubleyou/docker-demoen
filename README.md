# Docker demoen

This is a walkthrough for various technologies around containers.

## The lying linux kernel (network namespaces)

Information on how (network) namespaces are working under the linux operating system can be found [here](./lying-linux/docs/README.md).

## Docker containers

To build both containers and run them execute the following commands:

```shell
sudo docker build ./backend --tag=demo-backend
sudo docker build ./frontend --tag=demo-frontend

sudo docker run -d -p 8081:80 demo-backend
sudo docker run -d --add-host dhbw-weather-backend-service:host-gateway -p 8082:80 demo-frontend
```

## Kubernetes cluster

Detailed instructions on how to deploy the application on a Kubernetes cluster and on how to create a custom cluster on Azure using Azure Kubernetes Service are to be taken from the [`k8-docs`](./k8s-docs) subdirectory.
