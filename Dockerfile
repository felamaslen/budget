FROM node:10-alpine

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

WORKDIR /opt/app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

ARG BIRTH_DATE
ENV BIRTH_DATE=${BIRTH_DATE}

ARG STOCK_INDICES
ENV STOCK_INDICES=${STOCK_INDICES}

ARG DO_STOCKS_LIST
ENV DO_STOCKS_LIST=${DO_STOCKS_LIST}

ARG DEFAULT_FUND_PERIOD
ENV DEFAULT_FUND_PERIOD=${DEFAULT_FUND_PERIOD}

COPY . .
RUN npm run build

CMD ["npm", "start"]
