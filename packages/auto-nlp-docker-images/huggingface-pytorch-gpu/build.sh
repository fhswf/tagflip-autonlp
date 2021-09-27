#!/bin/bash
docker build --no-cache --build-arg github_token=$1 -t ghcr.io/fhswf/tagflip-autolp-huggingface-pytorch-gpu:latest -f Dockerfile .

