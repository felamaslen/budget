FROM docker.fela.space/budget:latest

USER root

RUN apk update && apk add --no-cache \
  giflib-dev \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

ENV NODE_ENV=test

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

RUN yarn add puppeteer@10.0.0

COPY . .
