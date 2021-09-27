import { Controller, Get, Param } from '@nestjs/common';
import { DeploymentInfo, Endpoint } from 'auto-nlp-shared-js';
import { DefaultDeploymentExecutionService } from './default-deployment-execution.service';
import { ProxyDeploymentService } from './proxy-deployment.service';
import { DeploymentService } from './deployment.service';

@Controller('/deployments/proxy')
export class ProxyDeploymentController {
  constructor(
    private readonly proxyDeploymentService: ProxyDeploymentService,
  ) {}

  @Get('/config')
  getTraefikConfiguration() {
    return this.proxyDeploymentService.getTraefikConfig();
  }

  @Get('/:deploymentId')
  async getProxyDeploymentEndpoint(
    @Param('deploymentId') deploymentId: string,
  ): Promise<Endpoint> {
    return this.proxyDeploymentService.getProxyDeploymentEndpoint(deploymentId);
  }
}
