#!/bin/bash

cecho() {
  local text="\e[44m===Auto-NLP=== $1\e[0m"
  echo -e "$text"
}

chkcmd() {
  if ! command -v $1 &>/dev/null; then
    echo "Command '$1' could not be found"
    exit
  fi
}

chkfile() {
  if [ ! -f "$1" ]; then
    echo "$1 does not exist."
    exit
  fi
}

envisset() {
  if [[ ! -v $1 ]]; then
    echo "Environment variable $1 is not set."
    exit
  fi
}

# Default values of arguments
SKIP_COMPILATION=0
ENV="docker-build.env"

# Loop through arguments and process them
for arg in "$@"
do
    case $arg in
        -sc|--skip-compilation)
        SKIP_COMPILATION=1
        shift
        ;;
    esac
done

cecho "Checking prerequisites"

# Check commands
chkcmd yalc

# Check env vars
chkfile $ENV
source $ENV
envisset AUTONLP_ENV
envisset AUTONLP_CORE_PUBLIC_URL

# Check config
CONFIG="config.$AUTONLP_ENV.yaml"
chkfile "$CONFIG"

if [[ $SKIP_COMPILATION -eq "1" ]]; then
  [ ! -d "packages/auto-nlp-ui/build" ] && echo "Missing build for auto-nlp-ui" && exit
  [ ! -d "packages/auto-nlp-core/dist" ] && echo "Missing build for auto-nlp-core" && exit
  echo "Compilation will be skipped"
fi


cecho "Copying config '$CONFIG' to auto-nlp-core/config"
cp "$CONFIG" packages/auto-nlp-core/config || exit
cecho "Copying config '$CONFIG' to auto-nlp-deployment/config"
cp "$CONFIG" packages/auto-nlp-deployment/config || exit

cecho "Copying local dependency auto-nlp-shared-js to auto-nlp-core"
cd packages/auto-nlp-shared-js || exit
yarn run build
yalc publish || exit
cd ../auto-nlp-core || exit
yalc add auto-nlp-shared-js
cd ../auto-nlp-ui || exit
yalc add auto-nlp-shared-js

cecho "Installing TypeScript dependencies"
if [[ $SKIP_COMPILATION -eq "0" ]]; then
  yarn install || exit
  echo -e "\e[44m\e[0m"
else
  echo "Skipped."
fi

# build UI
cecho "Generating config for auto-nlp-ui"
cd ../auto-nlp-ui/config || exit
cat <<EOT > config.$AUTONLP_ENV.json
{
  "api": "$AUTONLP_CORE_PUBLIC_URL/graphql"
}
EOT

cd ../

if [[ $SKIP_COMPILATION -eq "0" ]]; then
  cecho "Building auto-nlp-ui"
  if [  -d ./build ]; then
    echo "Deleting previous build."
    rm -r build
  fi
fi

if [[ $SKIP_COMPILATION -eq "0" ]]; then
  NODE_ENV=$AUTONLP_ENV yarn run build || exit
else
  echo "Skipped."
fi


cecho "Copy auto-nlp-ui/build to auto-nlp-core/client"
if [ -d ../auto-nlp-core/client ]; then
  rm -r ../auto-nlp-core/client || exit
fi
if [ ! -d ../auto-nlp-core/client ]; then
  mkdir -p ../auto-nlp-core/client
fi
cp build/* ../auto-nlp-core/client || exit

# build Core
cecho "Building auto-nlp-core"
if [[ $SKIP_COMPILATION -eq "0" ]]; then
  cd ../auto-nlp-core || exit
  yalc add auto-nlp-shared-js || exit
  yarn run prebuild || exit
  yarn run build || exit
else
  echo "Skipped."
fi

cd ../ || exit

cecho "Building docker"
docker-compose -f docker-compose.yaml --env-file ../$ENV build || exit

cecho "Pushing images"
docker-compose -f docker-compose.yaml --env-file ../$ENV push || exit

cecho "Starting services"
docker-compose -f docker-compose.yaml --env-file ../$ENV up -d || exit
