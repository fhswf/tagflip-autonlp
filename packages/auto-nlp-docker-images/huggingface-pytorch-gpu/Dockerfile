FROM pytorch/pytorch:1.8.1-cuda11.1-cudnn8-runtime

LABEL org.opencontainers.image.source https://github.com/fhswf/autonlp

#ARG github_token

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git

#RUN pip install \
#    seqeval>=1.2.2 \
#    tensorflow>=2 \

RUN pip install -e 'git+https://github.com/fhswf/tagflip-autonlp.git#egg=tagflip&subdirectory=packages/auto-nlp-workflow-lib'

