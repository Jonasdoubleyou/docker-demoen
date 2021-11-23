FROM nginx

COPY site /srv/site

COPY nginx.conf /etc/nginx/nginx.conf

RUN apt update
RUN apt install -y dnsutils
RUN apt install -y inetutils-ping

EXPOSE 80