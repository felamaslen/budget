FROM node:12-alpine

RUN apk add --no-cache \
  python \
  build-base \
  gcc \
  g++ \
  make \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  giflib-dev 

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

ENV PATH="/opt/app/node_modules/.bin:${PATH}"

ARG BIRTH_DATE
ENV BIRTH_DATE=${BIRTH_DATE}

ARG STOCK_INDICES
ENV STOCK_INDICES=${STOCK_INDICES}

ARG DO_STOCKS_LIST
ENV DO_STOCKS_LIST=${DO_STOCKS_LIST}

ARG DEFAULT_FUND_PERIOD
ENV DEFAULT_FUND_PERIOD=${DEFAULT_FUND_PERIOD}

COPY . .
RUN yarn build

CMD ["yarn", "start"]
