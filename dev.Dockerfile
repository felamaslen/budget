FROM docker.fela.space/budget_base:latest

RUN mkdir /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown appuser:appgroup /app
USER appuser
WORKDIR /app

COPY --chown=appuser:appgroup package.json yarn.lock ./

ENV NODE_ENV=development
ENV PATH="/app/node_modules/.bin:${PATH}"

RUN yarn install --frozen-lockfile

COPY --chown=appuser:appgroup nodemon.json ./

ENV SKIP_APP=false
ENV DEBUG=

CMD yarn start:dev
