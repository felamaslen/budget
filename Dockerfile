FROM node:10-alpine

RUN apk add --no-cache python gcc g++ make

WORKDIR /opt/app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY . .
RUN npm run build

CMD ["npm", "start"]
