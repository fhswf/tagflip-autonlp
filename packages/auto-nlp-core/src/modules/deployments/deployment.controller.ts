import { Controller, Get, Param } from '@nestjs/common';
import { DeploymentInfo, Endpoint } from 'auto-nlp-shared-js';
import { DefaultDeploymentExecutionService } from './default-deployment-execution.service';
import { ProxyDeploymentService } from './proxy-deployment.service';
import { DeploymentService } from './deployment.service';

@Controller('/deployments')
export class DeploymentController {
  constructor(
    private readonly deploymentService: DeploymentService,
    private readonly deploymentExecutionService: DefaultDeploymentExecutionService,
    private readonly deploymentProxyInfoService: ProxyDeploymentService,
  ) {}

  @Get('/')
  async getDeployments(): Promise<DeploymentInfo[]> {
    const deployments = await this.deploymentService.findAll();
    const infos = [];
    for (const deployment of deployments) {
      infos.push(
        await this.deploymentExecutionService.getDeployment(
          deployment.deploymentId,
        ),
      );
    }
    return infos;
  }
}
