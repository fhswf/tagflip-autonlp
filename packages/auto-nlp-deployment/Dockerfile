FROM python:3.8-slim-buster

ARG PORT=3002
ENV AUTONLP_DEPLOYMENT_PORT=${PORT}

RUN apt update && \
    apt install -y  git \
                    libcurl4-openssl-dev \
                    gnupg2 \
                    pass \
                    apt-transport-https \
                    ca-certificates \
                    curl \
                    gnupg \
                    lsb-release \
                    openssh-client

RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
RUN echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null


RUN apt update && apt install -y docker-ce-cli

WORKDIR /opt/app
RUN pip install pipenv
RUN pip install uvicorn

# Copy code
COPY Pipfile .
COPY Pipfile.lock .
COPY ./src ./src
COPY ./config ./config

# Install
RUN pipenv install


#RUN mkdir -p /root/.ssh
#RUN chown root:root /root/.ssh
#RUN echo '#!/bin/sh\n\
#set -e\n\
#cp -R /tmp/.ssh /root/.ssh\n\
#chmod 700 /root/.ssh\n\
#\
#exec "$@"\
#' > /bin/entrypoint.sh
#RUN chmod +x /bin/entrypoint.sh

#ENTRYPOINT ["/bin/entrypoint.sh", "pipenv", "run", "uvicorn", "main:app", "--host","0.0.0.0", "--port", "${AUTONLP_DEPLOYMENT_PORT}", "--app-dir", "./src"]
ENTRYPOINT ["pipenv", "run", "uvicorn", "main:app", "--host","0.0.0.0", "--port", "${AUTONLP_DEPLOYMENT_PORT}", "--app-dir", "./src"]
