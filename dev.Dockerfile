FROM node:12-alpine

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
ENV PATH="/opt/app/node_modules/.bin:${PATH}"

RUN yarn install --frozen-lockfile

ENV SKIP_APP=false
ENV DEBUG=

CMD nodemon | roarr pretty-print
