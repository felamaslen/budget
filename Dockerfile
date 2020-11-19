# docker.fela.space/budget_base

FROM node:12-alpine

RUN apk update && apk add --no-cache \
  python \
  git \
  build-base \
  gcc \
  g++ \
  make \
  postgresql-dev \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  giflib-dev 
