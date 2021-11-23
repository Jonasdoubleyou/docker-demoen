# Docker Demoen

```
sudo docker build ./backend --tag=demo-backend
sudo docker build ./frontend --tag=demo-frontend

sudo docker run -d -p 8081:80 demo-backend
sudo docker run -d --add-host backend:host-gateway -p 8082:80 demo-frontend
```