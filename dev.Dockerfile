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
COPY yarn.lock ./

ENV NODE_ENV=development
ENV BABEL_ENV=node

RUN yarn install --frozen-lockfile

ENV SKIP_APP=false
ENV DEBUG=

CMD ./node_modules/.bin/nodemon
