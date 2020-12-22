FROM docker.fela.space/budget_base:latest

RUN mkdir /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown appuser:appgroup /app
USER appuser
WORKDIR /app

COPY --chown=appuser:appgroup package.json ./
COPY --chown=appuser:appgroup yarn.lock ./

RUN yarn install --frozen-lockfile

ENV PATH="/app/node_modules/.bin:${PATH}"

COPY --chown=appuser:appgroup . .
RUN yarn build

CMD ["yarn", "start"]
