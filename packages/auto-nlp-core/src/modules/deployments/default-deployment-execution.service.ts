import {
  CacheInterceptor,
  CacheTTL,
  HttpService,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { classToPlain, plainToClass } from 'class-transformer';
import { DeploymentExecutionService } from './deployment-execution-service.interface';
import { DeploymentService } from './deployment.service';
import { DeploymentInfo } from './entities/deployment-info.entity';
import { DeploymentTask } from './entities/deployment-task.entity';

@Injectable()
export class DefaultDeploymentExecutionService
  implements DeploymentExecutionService {
  private deploymentServiceUrl: string;
  private logger: Logger = new Logger(DefaultDeploymentExecutionService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly deploymentService: DeploymentService,
    private readonly configService: ConfigService, // private readonly deploymentService: DeploymentService,
  ) {
    this.deploymentServiceUrl = this.configService.get(
      'AUTONLP_DEPLOYMENT_URL',
    );
  }

  async createDeployment(deploymentTask: DeploymentTask) {
    try {
      const response = await this.httpService
        .post(
          `${this.deploymentServiceUrl}/deployment`,
          classToPlain(deploymentTask),
        )
        .toPromise();
      return plainToClass(DeploymentInfo, response.data);
    } catch (e) {
      if (e.response.status == HttpStatus.NOT_FOUND) {
        throw new NotFoundException();
      }
      throw e;
    }
  }

  @UseInterceptors(CacheInterceptor)
  async getDeployment(deploymentId: string): Promise<DeploymentInfo> {
    try {
      const deployment = await this.deploymentService.findByExternalDeploymentId(
        deploymentId,
      );

      const response = await this.httpService
        .get(
          `${this.deploymentServiceUrl}/deployment/${deploymentId}/runtime/${deployment.runtimeDescription.runtime}`,
        )
        .toPromise();
      return plainToClass(DeploymentInfo, response.data);
    } catch (e) {
      if (e.response.status == HttpStatus.NOT_FOUND) {
        throw new NotFoundException();
      }
      throw e;
    }
  }

  async removeDeployment(deploymentId: string) {
    try {
      const deployment = await this.deploymentService.findByExternalDeploymentId(
        deploymentId,
      );

      await this.httpService
        .delete(
          `${this.deploymentServiceUrl}/deployment/${deploymentId}/runtime/${deployment.runtimeDescription.runtime}`,
        )
        .toPromise();
    } catch (e) {
      if (e.response.status == HttpStatus.NOT_FOUND) {
        throw new NotFoundException();
      }
      throw e;
    }
  }

  async testDeployment(deploymentId: string, input: Object): Promise<Object> {
    try {
      const deployment = await this.getDeployment(deploymentId);

      const response = await this.httpService
        .request({
          url: deployment.endpoint.url,
          method: deployment.endpoint.method,
          headers: {
            'Content-Type': 'application/json',
          },
          data: JSON.stringify(input),
        })
        .toPromise();
      const data = response.data;
      return data;
    } catch (e) {
      this.logger.error(`Could not test deployment due to error ${e}`);
      throw e;
    }
  }
}
