# docker.fela.space/budget_base

FROM node:14-alpine

RUN apk update && apk add --no-cache \
  bash \
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
  vips-dev \
  glib-dev \
  giflib-dev 
