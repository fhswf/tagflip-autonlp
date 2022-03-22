FROM node:17.7.1-buster-slim

ARG ASSET_PATH
ENV ASSET_PATH=${ASSET_PATH}
WORKDIR /opt/src/app

COPY .yarn ./.yarn
COPY .yarnrc.yml ./.yarnrc.yml

RUN corepack prepare yarn@3.2.0 --activate
RUN yarn --version

COPY package.json ./
COPY yarn.lock ./
COPY packages/auto-nlp-shared-js/package.json ./packages/auto-nlp-shared-js/package.json
COPY packages/auto-nlp-core/package.json ./packages/auto-nlp-core/package.json
COPY packages/auto-nlp-ui/package.json ./packages/auto-nlp-ui/package.json

RUN yarn install

COPY tsconfig.json ./

# auto-nlp-core 
COPY packages/auto-nlp-shared-js/ packages/auto-nlp-shared-js/
COPY packages/auto-nlp-core/ packages/auto-nlp-core/
COPY packages/auto-nlp-ui/ packages/auto-nlp-ui/

RUN yarn workspaces foreach -t -v run build

WORKDIR packages/auto-nlp-core

#RUN ls -l dist

CMD ["yarn", "run","start"]