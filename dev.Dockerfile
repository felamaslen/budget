FROM node:10-alpine

RUN apk add --no-cache python gcc g++ make jq postgresql-dev
ENV NODE_JQ_SKIP_INSTALL_BINARY=true

WORKDIR /opt/app

COPY package.json ./
COPY package-lock.json ./

ENV NODE_ENV=development
ENV BABEL_ENV=node

RUN npm install

ENV SKIP_APP=false
ENV DEBUG=

CMD npm run dev:run
