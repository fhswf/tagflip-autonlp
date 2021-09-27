FROM python:3.8-slim-buster

ARG PORT=3001
ENV AUTONLP_HUGGINGFACE_SEARCH_PORT=$PORT

WORKDIR /opt/app

RUN pip install pipenv

RUN pip install uvicorn

# Copy code
COPY Pipfile .
COPY Pipfile.lock .
COPY ./src ./src

# Install
RUN pipenv install

ENTRYPOINT ["pipenv", "run", "uvicorn", "main:app", "--host","0.0.0.0", "--port", "$AUTONLP_HUGGINGFACE_SEARCH_PORT", "--app-dir", "./src"]
