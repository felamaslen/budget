FROM node:10-alpine

WORKDIR /opt/app

COPY package.json ./
COPY package-lock.json ./

RUN apk add --no-cache python gcc g++ make

RUN npm install --only=production
RUN npm install --only=development

CMD ["npm", "run", "dev:run"]
