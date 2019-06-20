FROM node:10-alpine

WORKDIR /opt/app

COPY package.json ./
COPY package-lock.json ./

RUN apk add --no-cache python gcc g++ make

RUN npm ci

COPY . .
