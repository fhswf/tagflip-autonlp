import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DeploymentInfo, Endpoint } from 'auto-nlp-shared-js';
import { Environment } from '../../config/environment.class';
import { DefaultDeploymentExecutionService } from './default-deployment-execution.service';
import { DeploymentService } from './deployment.service';

const PATH_PREFIX = 'auto-nlp-proxy';

@Injectable()
export class ProxyDeploymentService {
  constructor(
    private readonly deploymentService: DeploymentService,
    private readonly deploymentExecutionService: DefaultDeploymentExecutionService,
    private readonly environment: Environment,
  ) {}

  async getProxyDeploymentEndpoint(deploymentId: string): Promise<Endpoint> {
    const currentDeploymentInfo = await this.deploymentExecutionService.getDeployment(
      deploymentId,
    );
    if (
      !currentDeploymentInfo.endpoint ||
      !this.environment.AUTONLP_DEPLOYMENT_PROXY_ENTRYPOINT_URL
    )
      return null;
    const proxyDeploymentPath = getProxyDeploymentPath(currentDeploymentInfo);
    return {
      url: new URL(proxyDeploymentPath, this.getProxyEntrypoint()).toString(),
      method: 'POST',
      signature: currentDeploymentInfo.endpoint.signature,
    };
  }

  private getProxyEntrypoint() {
    let entrypoint = this.environment.AUTONLP_DEPLOYMENT_PROXY_ENTRYPOINT_URL;
    if (!entrypoint)
      throw new HttpException(
        'Environment variable AUTONLP_DEPLOYMENT_PROXY_ENTRYPOINT_URL is not defined.',
        HttpStatus.PRECONDITION_FAILED,
      );
    return entrypoint;
  }

  async getTraefikConfig() {
    const deployments = await this.deploymentService.findAll();

    const config = {
      http: {
        routers: {},
        middlewares: {},
        services: {},
      },
    };
    for (const deployment of deployments) {
      const currentDeploymentInfo = await this.deploymentExecutionService.getDeployment(
        deployment.deploymentId,
      );
      if (currentDeploymentInfo.endpoint) {
        let traefikConfig = new TraefikDeploymentConfig(currentDeploymentInfo);
        Object.assign(config.http.routers, traefikConfig.router);
        Object.assign(config.http.middlewares, traefikConfig.middlewares);
        Object.assign(config.http.services, traefikConfig.services);
      }
    }
    return config;
  }
}

function getProxyDeploymentPath(deploymentInfo: DeploymentInfo) {
  return `${PATH_PREFIX}/${deploymentInfo.deploymentId}`;
}

class TraefikDeploymentConfig {
  private readonly parsedDeploymentUrl: URL;

  constructor(private readonly deployment: DeploymentInfo) {
    this.parsedDeploymentUrl = new URL(deployment.endpoint.url);
  }

  get router() {
    return {
      [`to-auto-nlp-deployment-${this.deployment.deploymentId}`]: {
        rule: `PathPrefix(\`/${getProxyDeploymentPath(this.deployment)}\`)`,
        middlewares: Object.keys(this.middlewares),
        service: Object.keys(this.services)[0],
      },
    };
  }

  get middlewares(): Record<string, any> {
    return {
      [`auto-nlp-deployment-proxy-${this.deployment.deploymentId}-replace-path-regex`]: {
        replacePathRegex: {
          regex: `^/${getProxyDeploymentPath(this.deployment)}`,
          replacement:
            this.parsedDeploymentUrl.pathname + this.parsedDeploymentUrl.search,
        },
      },
    };
  }

  get services(): Record<string, any> {
    return {
      [`auto-nlp-deployment-proxy-${this.deployment.deploymentId}`]: {
        loadBalancer: {
          servers: [{ url: this.parsedDeploymentUrl }],
        },
      },
    };
  }
}
