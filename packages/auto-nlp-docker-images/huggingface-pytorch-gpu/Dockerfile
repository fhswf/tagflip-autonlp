FROM pytorch/pytorch:1.8.1-cuda11.1-cudnn8-runtime

LABEL org.opencontainers.image.source https://github.com/fhswf/autonlp

#ARG github_token

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git

RUN pip install \
    mlflow>=1.24 \
    datasets>=1.18.0 \
    transformers>=4.5.1 \
    seqeval>=1.2.2 \
    scikit-learn==0.24.2 \
    tensorflow>=2 \
    torchvision>=0.9.1 \
    pandas>=1.2.4 \
    boto3>=1.17.0
#RUN pip install -e "git+https://${github_token}@github.com/fhswf/tagflip-autonlp.git#egg=tagflip&subdirectory=packages/auto-nlp-workflow-lib"
RUN pip install -e "git+https://github.com/fhswf/tagflip-autonlp.git#egg=tagflip&subdirectory=packages/auto-nlp-workflow-lib"

