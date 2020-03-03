FROM node:12.14.1-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

COPY .eslintignore ./
COPY .eslintrc.json ./
RUN npm run lint

COPY graphql ./graphql
COPY scripts ./scripts

CMD npm start
