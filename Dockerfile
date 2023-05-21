# https://nodejs.org/ja/docs/guides/nodejs-docker-webapp/
FROM  node:18-alpine3.15
WORKDIR /app

COPY ./package*.json ./
RUN npm install

COPY . .