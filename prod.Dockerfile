FROM docker.fela.space/budget_base:latest

WORKDIR /opt/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

ENV PATH="/opt/app/node_modules/.bin:${PATH}"

COPY . .
RUN yarn build

CMD ["yarn", "start"]

