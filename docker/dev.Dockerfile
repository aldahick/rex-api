FROM node:12.18-alpine

WORKDIR /app

RUN apk add python

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY tsconfig.json ./
COPY src ./src
RUN yarn build

COPY graphql ./graphql

CMD yarn start:dev
