# TagFlip - AutoNLP

TagFlip AutoNLP enables automated training and deployment of language models for certain NLP tasks
(currently only Token Classification is implemented) based on TagFlip annotated data or external Hugging Face datasets.

![train_deploy](https://user-images.githubusercontent.com/26322808/124458002-c37f6c80-dd8c-11eb-8f5c-70695ce72b41.gif)

This project uses [netJS](https://nestjs.com/) for the main backend and [mlFlow](https://mlflow.org/) for the machine learning workflows.
The frontend is built using React and [Ant Design](https://ant.design/).

## Try it!

TagFlip AutoNLP is available at [autonlp.informatik.fh-swf.de](https://autonlp.informatik.fh-swf.de).

## Building & Deploying

### Docker

Currently, installing via Docker Compose is the easiest way to deploy the deploy the application.

#### Prerequisites

- At least one Linux-based Docker host in version 20 or newer.
- NVIDIA Container Toolkit per Docker host on which NLP models are trained (optional).
- A Traefik Edge Router installation on each Docker host which should to be used for deploying trained models. If only a
  single Docker host is used in total the Traefik installation is done automatically when the core application is
  deployed via the installation script described later. For any additional Docker host on which model deployments should
  be deployed, the following Docker Compose deployment must be applied per host:

```yaml
version: '3.6'
services:
  auto-nlp-traefik:
    image: 'traefik:v2.4'
    container_name: 'auto-nlp-traefik'
    command:
      - '--api.insecure=true'
      - '--providers.docker=true'
      - '--providers.docker.exposedbydefault=false'
      - '--providers.http=true'
      - '--entrypoints.web.address=:80'
    ports:
      - '${AUTONLP_TRAEFIK_ENTRYPOINT_PORT}:80'
      - '8086:8080'
    volumes:
      - '/var/run/docker.sock:/var/run/docker.sock:ro'
    networks:
      - auto-nlp-deployments
    restart: always

networks:
  auto-nlp-deployments:
    name: 'auto-nlp-deployments'
    driver: 'bridge'
```

#### 1. Creating the configuration file `config.docker.yaml`.

TagFlip AutoNLP installation using Docker requires a configuration file `config.docker.yaml`
in root directory of the project. In the following an example of this file is shown and described.

```yaml
dataset-providers:
  tagflip.annotations:
    type: 'tagflip'
    config:
      api: 'https://url-to-tagflip-v1-api'

  huggingface:
    type: 'huggingface'

training-environments:
  docker:
    - name: 'some-docker-host'
      description: Docker training on some-docker-host
      ssh:
        username: 'some-user'
        host: 'some-docker-host'
        port: 22
      parameters:
        gpu_id: { choice: [0, 1] }

    - name: 'localhost'
      parameters:
        gpu_id: { choice: [0] }

deployment-environments:
  docker:
    - name: 'localhost'
      entrypoint: 'http://host.docker.internal:8085'
      parameters:
        worker_count: { range: [1, 12] }

    - name: 'some-deployment-host'
      ssh:
        username: 'some-user'
        host: 'some-deployment-host'
        port: 22
      entrypoint: 'https://public-url-to-some-deployment-host'
      parameters:
        worker_count: { range: [1, 16] }
```

##### dataset-providers

The key `dataset-providers` defines the data sources for datasets of the application. Currently two types of dataset
providers are supported.

_tagflip_
: Dataset providers of type _tagflip_ can refer to a TagFlip-V1 backend. TagFlip-V1 is the previous TagFlip project,
which can be found here: https://github.com/fhswf/tagflip-backend - In the future, this dataset provider will be
replaced by this repository's TagFlip project once the old functionality is integrated.

_huggingface_: Dataset providers of type _huggingface_ allow access to hugging face datasets. No further configuration
is required. The application takes care that valid datasets are provided.

While there are multiple tagflip dataset-providers possible (multiple instances of TagFlip on different servers),, there
should only be one dataset-provider of type _huggingface_ defined at max.

##### training-environments

Under the key `training-environments` the runtime environments for the training are being defined. Currently, only
Docker environments are being supported properly for training. If a defined Docker runtime is a _remote_ Docker
environment, an SSH configuration must be specified under the `ssh` key, as shown. For authentication, a corresponding
key-file is expected to be found in the user directory `~/.ssh` then.

Per Docker runtime environment the parameter configuration

```yaml
parameters:
  gpu_id: { choice: [0, 1] }
```

can be configured to specify a list of GPU IDs that can be selected when scheduling a training. In this example, the
runtime environment has two GPUs (ID 0, ID 1) which are available as selection options during training scheduling. The
prerequisite for accelerated training is of course, that the NVIDIA Container Toolkit is installed on the Docker system.
The GPU IDs of a Docker host can be determined via the command `nvidia-smi`.

##### deployment-environments

Under the key `deployment-environments` runtime environments for deployments can be defined. Currently, only Docker
environments are supported.

If a defined Docker runtime is a _remote_ Docker environment, an SSH configuration must be specified under the `ssh`
key, as shown. For authentication, a corresponding key-file is expected to be found in the user directory `~/.ssh` then.

Deployments of trained models deployed in a Docker environment are being accessed via a Traefik Edge Router. Therefore,
a Traefik must be installed, as described in the prerequisites, on each Docker host that is being configured
under `deployment-environments`. If there is only one Docker host for the application and all it's trainings and
deployments, the Taefik Edge Router installation will be done automatically by applying the installation script as
described below.

However, a public URL must be specified via the `entrypoint` key, that references or redirects to the Traefik
entrypoint, so that the deployments can be accessed via that URL.

The configuration statement

```yaml
parameters:
  worker_count: { range: [1, 16] }
```

can be used to specify the minimum and maximum number of worker processes per deployment on the Docker host. The weaker
the system the more restrictive the values should be, since model deployments generally require a lot of resources and
one model instance is loaded per worker.

#### 2. Creating the .env file `docker-build.env`

The installation requires the existence of certain Environment variables. The following environment variables must be
set for the application:

```yaml
COMPOSE_PROJECT_NAME=auto-nlp # Docker Compose project name

  # TagFlip AutoNLP
AUTONLP_ENV=docker # (don't chance since we use docker as installation target)
AUTONLP_CORE_PORT=3000 # Port for the deployment of the AutoNLP Core component
AUTONLP_TRAEFIK_ENTRYPOINT_PORT=8085 # Port for deployment of the central Traefik proxy
AUTONLP_MINIO_PORT=3006 # Port for the deployment of the MinIO-S3 server
AUTONLP_CORE_PUBLIC_URL=http://public-url-to-auto-nlp-core:3000 # A public URL for accessing the AutoNLPCore component
AUTONLP_DEPLOYMENT_PROXY_ENTRYPOINT_URL=http://public-url-to-traefik-proxy:8085 # A public URL for accessing the central Traefik Proxy

#MongoDB
# if not mongodb://localhost:27017 without authentication (standard) should be used
MONGODB_URI=
MONGODB_USER=
MONGODB_PASSWORD=

#REDIS
# if not localhost:6379 without authentication (standard) should be used
REDIS_HOST=
REDIS_USER=
REDIS_PASSWORD=

# MLflow specific variables
MLFLOW_TRACKING_PORT=3005 # Port for the deployment of the MLflow Tracking Servers
MLFLOW_TRACKING_URI=http://public-url-to-mlflow-tracking-server:3005 # A public URL for accessing the MLflow-Tracking-Server
MLFLOW_TRACKING_USERNAME= # A Username for accessing the MLflow Tracking Server
MLFLOW_TRACKING_PASSWORD= # A Password for accessing the MLflow Tracking Server
MLFLOW_S3_ENDPOINT_URL=http://public-url-to-s3-endpoint:3006 # A public URL for accessing the S3-Server (MinIO)
AWS_ACCESS_KEY_ID=minioadmin # S3 Bucket Access Key
AWS_SECRET_ACCESS_KEY=minioadmin # S3 Bucket Secret Key

BACKEND_STORE_URI=sqlite:///data/sqlite.db #  Database file, which is being used inside MLflow Tracking-Servers verwendet wird (don't change)
BUCKET_URI_OR_LOCAL_PATH=s3://tagflip-autonlp # Name of the S3-Bucket where artifacts will be stored (don't change)
```

##### 3. Running the installation

If the root directory of the project contains a configuration file `config.docker.yaml`
and an .env file `docker-build.env` are present in the root directory,
the installation script can be executed.

The installation can be started via

```shell
./build.sh
```

Running the script will perform a Docker Compose deployment. The associated Docker Compose file is located in the
path `./packages/docker-compose.yaml`.

### Notes regarding CI builds

Originally, [yalc](https://github.com/wclr/yalc) was used to manage dependencies between `auto-nlp-core` , `auto-nlp-shared-js`, and `auto-nlp-ui`.
However, this approach complicates CI builds. The build now uses _yarn workspaces_ and _yarn PnP_ for this purpose.

To build the backend, run

```shell
yarn install
yarn workspaces foreach -t -v run build
```

The backend can be started using

````shell
yarn workspace auto-nlp-core run start
```

## Credits

Main Author: Timo Neuhaus (neuhaus.timo@fh-swf.de)
````
