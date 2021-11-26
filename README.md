# Docker Demoen

This is a walkthrough for various technologies around containers. 

## The lying linux kernel (namespaces)

Run `sudo /lying-linux/init` on a Linux machine to setup a new bridge "containers" which seemingly holds two interfaces, "container1-out" and "container2-out". 
Try pinging `ping 192.168.2.1` to see a seemingly different device answer. 
In fact this is not a different device, just an interface in a different namespace (container1-ns). 
By running `sudo ./start-container1` one can start a shell in that namespace, and ping the host machine the other way with `ping 192.168.0.1`. 
Running `ip a` inside the container shows a completely different network stack (one interface "container1-in"). 
"container1-in" is in fact a virtual interface with the other end being "container1-out". 
Thus when inside the namespace one sends packets to the "physical interface", in fact the root namespace receives them. 


## Docker Containers

To build both containers and run them execute the following commands:

```
sudo docker build ./backend --tag=demo-backend
sudo docker build ./frontend --tag=demo-frontend

sudo docker run -d -p 8081:80 demo-backend
sudo docker run -d --add-host backend:host-gateway -p 8082:80 demo-frontend
```
