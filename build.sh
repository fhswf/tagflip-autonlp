#! /bin/bash


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

ENV="docker-build.env"
chkfile $ENV
source $ENV
envisset AUTONLP_ENV
envisset AUTONLP_CORE_PUBLIC_URL

cecho "Building docker"
docker-compose -f docker-compose.yaml --env-file ../$ENV build || exit

cecho "Pushing images"
docker-compose -f docker-compose.yaml --env-file ../$ENV push || exit

cecho "Starting services"
docker-compose -f docker-compose.yaml --env-file ../$ENV up -d || exit