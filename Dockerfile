FROM node:16-alpine

RUN apk update && apk add --no-cache \
  bash \
  python3 \
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

RUN mkdir /app
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown -R appuser:appgroup /app
USER appuser

COPY --chown=appuser:appgroup package.json ./
COPY --chown=appuser:appgroup yarn.lock ./

RUN yarn install --frozen-lockfile

COPY --chown=appuser:appgroup . .
RUN yarn build

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}
ENV PATH="/app/node_modules/.bin:${PATH}"

CMD ["yarn", "start"]
