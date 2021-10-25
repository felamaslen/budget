FROM docker.fela.space/budget_base:latest

RUN mkdir /app
WORKDIR /app

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}
ENV PATH="/app/node_modules/.bin:${PATH}"

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown -R appuser:appgroup /app
USER appuser

COPY --chown=appuser:appgroup package.json ./
COPY --chown=appuser:appgroup yarn.lock ./

RUN yarn install --frozen-lockfile

ENV PATH="/app/node_modules/.bin:${PATH}"

COPY --chown=appuser:appgroup . .
RUN yarn build

CMD ["yarn", "start"]
