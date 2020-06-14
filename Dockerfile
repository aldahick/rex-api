FROM node:12.18-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install --production

COPY dist ./dist

COPY graphql ./graphql

CMD npm start
