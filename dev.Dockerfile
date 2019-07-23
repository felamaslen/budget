FROM node:10-alpine

RUN apk add --no-cache python gcc g++ make

WORKDIR /opt/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install --only=production
RUN npm install --only=development

ENV SKIP_APP=false

CMD ["node_modules/.bin/nodemon", "-w", "./api/src", "index.js"]
