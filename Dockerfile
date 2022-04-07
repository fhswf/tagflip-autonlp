FROM node:17.7.1-buster-slim as build

# TODO: This only works at build-time, but we want container images suitable for test and prod
ARG ASSET_PATH
ENV ASSET_PATH=${ASSET_PATH}
ARG GRAPHQL_URL
ENV GRAPHQL_URL=${GRAPHQL_URL}
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

# Core container
FROM node:17.7.1-buster-slim as core

WORKDIR /opt/src/app

COPY --from=build /opt/src/app/.yarn ./.yarn
COPY --from=build /opt/src/app/.yarnrc.yml ./
COPY --from=build /opt/src/app/.pnp.cjs ./
COPY --from=build /opt/src/app/.pnp.loader.mjs ./

RUN corepack prepare yarn@3.2.0 --activate
RUN yarn --version

COPY --from=build /opt/src/app/yarn.lock ./yarn.lock
COPY --from=build /opt/src/app/package.json ./package.json
COPY --from=build /opt/src/app/packages/auto-nlp-shared-js ./packages/auto-nlp-shared-js
COPY --from=build /opt/src/app/packages/auto-nlp-core ./packages/auto-nlp-core

CMD ["yarn", "workspace", "auto-nlp-core", "run", "start"]


# Core container
FROM nginx:latest as nginx

COPY --from=build /opt/src/app/packages/auto-nlp-ui/build/* /usr/share/nginx/html/autonlp/
COPY nginx/autonlp.conf /etc/nginx/conf.d/