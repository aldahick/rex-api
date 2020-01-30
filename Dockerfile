FROM node:12.14.1-alpine

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install

COPY tsconfig.json /app/tsconfig.json
COPY src /app/src
RUN npm run build

COPY .eslintrc.json /app/.eslintrc.json
RUN npm run lint

CMD npm start
