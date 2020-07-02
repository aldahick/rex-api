FROM node:12.18-alpine

WORKDIR /app

RUN apk add python

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

COPY graphql ./graphql

CMD npm run start:dev
