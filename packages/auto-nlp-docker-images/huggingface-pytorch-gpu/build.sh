#!/bin/bash
docker build --no-cache --build-arg github_token=$1 -t registry.docker.n.euhaus.net/huggingface-pytorch-gpu:latest -f Dockerfile .

