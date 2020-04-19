FROM node:10-alpine

RUN apk add --no-cache \
  python \
  build-base \
  gcc \
  g++ \
  make \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  giflib-dev 

WORKDIR /opt/app

COPY package.json ./
COPY package-lock.json ./

ENV NODE_ENV=development
ENV BABEL_ENV=node

RUN npm install

ENV SKIP_APP=false
ENV DEBUG=

CMD ./node_modules/.bin/nodemon
