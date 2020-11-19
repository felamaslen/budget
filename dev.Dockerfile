FROM docker.fela.space/budget_base:latest

WORKDIR /opt/app

COPY package.json ./
COPY yarn.lock ./

ENV NODE_ENV=development
ENV PATH="/opt/app/node_modules/.bin:${PATH}"

RUN yarn install --frozen-lockfile

ENV SKIP_APP=false
ENV DEBUG=

CMD nodemon | roarr pretty-print
