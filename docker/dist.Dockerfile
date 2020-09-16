# This image is optimized for deployment to my (@aldahick's) personal server,
# and makes assumptions you may not want to make. For most usage, the
# docker/dev.Dockerfile is recommended.

FROM node:12.18-alpine

RUN apk add python

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn --production --frozen-lockfile

COPY dist ./dist

COPY graphql ./graphql

CMD yarn start
