import { Logger } from '@nestjs/common';
import { Controller, Get, Param } from '@nestjs/common';
import { DeploymentInfo, Endpoint } from 'auto-nlp-shared-js';
import { DefaultDeploymentExecutionService } from './default-deployment-execution.service';
import { ProxyDeploymentService } from './proxy-deployment.service';
import { DeploymentService } from './deployment.service';

const logger = new Logger('ProxyDeployment');


@Controller('deployments/proxy')
export class ProxyDeploymentController {
  constructor(
    private readonly proxyDeploymentService: ProxyDeploymentService,
  ) { }

  @Get('config')
  async getTraefikConfiguration(): Promise<Object> {
    logger.debug('GET config: getting config')
    return this.proxyDeploymentService.getTraefikConfig()
      .then(config => {
        logger.debug('GET config: ' + config);
        return config;
      })
      .catch(err => {
        logger.debug('GET config: error ' + err);
        return {}
      })
  }

  @Get(':deploymentId')
  async getProxyDeploymentEndpoint(
    @Param('deploymentId') deploymentId: string,
  ): Promise<Endpoint> {
    return this.proxyDeploymentService.getProxyDeploymentEndpoint(deploymentId);
  }
}
