FROM node:10-alpine

RUN apk add --no-cache python gcc g++ make

WORKDIR /opt/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install --only=production
RUN npm install --only=development

ENV NODE_ENV=development
ENV BABEL_ENV=node

ENV SKIP_APP=false
ENV DEBUG=

CMD node_modules/.bin/babel-watch -I -w ./api/src ./api/src
