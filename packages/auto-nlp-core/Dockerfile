FROM node:14.16.1-buster-slim

COPY .yalc/auto-nlp-shared-js /opt/src/app/.yalc/auto-nlp-shared-js

WORKDIR /opt/src/app

COPY package.json ./

RUN yarn install

COPY ./client ./client
COPY ./dist ./dist

CMD ["yarn", "run","start:prod"]