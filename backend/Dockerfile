FROM node:current-alpine3.12

COPY package.json      /srv/app/
COPY package-lock.json /srv/app/

RUN cd /srv/app/ && npm ci

COPY src/ /srv/app/src/

CMD cd /srv/app/ && npm start