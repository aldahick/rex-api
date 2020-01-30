FROM node:12.14.1-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY tsconfig.json ./
COPY src /app/src
RUN npm run build

COPY .eslintignore ./
COPY .eslintrc.json ./
RUN npm run lint

CMD npm start
