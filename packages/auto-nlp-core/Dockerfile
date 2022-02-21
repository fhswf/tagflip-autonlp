FROM node:14.19.0-buster-slim

COPY .yalc/auto-nlp-shared-js /opt/src/app/.yalc/auto-nlp-shared-js

WORKDIR /opt/src/app

COPY package.json ./

RUN yarn install

COPY ./client ./client
COPY ./dist ./dist

#temporary fixdocker logs 
COPY ./src ./src
COPY tsconfig.json ./
COPY tsconfig.build.json ./

#CMD ["yarn", "run","start:prod"]
CMD ["yarn", "run","start"]