FROM node:10-alpine

RUN apk add --no-cache python gcc g++ make

WORKDIR /opt/app

COPY package.json ./
COPY package-lock.json ./

ENV NODE_ENV=development
ENV BABEL_ENV=node

RUN npm install

ENV SKIP_APP=false
ENV DEBUG=

CMD node_modules/.bin/babel-watch -I -w ./api/src ./api/src
