import {
  HttpService,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { RuntimeEnvironment } from '../../runtimes/entities/runtime-environment-config.entity';
import { RuntimeEnvironmentService } from '../../runtimes/runtime-environment-service.interface';

@Injectable()
export class DeploymentRuntimeEnvironmentService
  implements RuntimeEnvironmentService {
  private deploymentServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.deploymentServiceUrl = this.configService.get(
      'AUTONLP_DEPLOYMENT_URL',
    );
  }

  async getTypes(): Promise<string[]> {
    const response = await this.httpService
      .get<string[]>(`${this.deploymentServiceUrl}/deployment/runtime/types`)
      .toPromise();

    return response.data;
  }

  async findByName(name: string): Promise<RuntimeEnvironment> {
    const response = await this.httpService
      .get(`${this.deploymentServiceUrl}/deployment/runtime/${name}`)
      .toPromise();

    if (response.status === HttpStatus.NOT_FOUND) {
      throw new NotFoundException(`No runtime found for name ${name}`);
    }
    if (!Object.keys(response.data).includes('type')) {
      throw new RuntimeException('Cannot determine RuntimeConfig type');
    }

    // let runtimeType = response.data['type'];
    // const clazz = TypesForRuntimeType.has(runtimeType)
    //   ? TypesForRuntimeType.get(runtimeType)
    //   : TrainingRuntimeEnvironmentConfig;

    return plainToClass(RuntimeEnvironment, response.data);
  }

  async findAll(): Promise<RuntimeEnvironment[]> {
    const response = await this.httpService
      .get<[]>(`${this.deploymentServiceUrl}/deployment/runtime`)
      .toPromise();
    return plainToClass(RuntimeEnvironment, response.data);
  }

  async findAllByType(runtimeType: string): Promise<RuntimeEnvironment[]> {
    // const clazz = TypesForRuntimeType.has(runtimeType)
    //   ? TypesForRuntimeType.get(runtimeType)
    //   : TrainingRuntimeEnvironmentConfig;
    return await this.findAllByRuntimeType(runtimeType, RuntimeEnvironment);
  }

  private async findAllByRuntimeType<T extends RuntimeEnvironment>(
    runtimeType: string,
    clazz: ClassConstructor<T>,
  ): Promise<T[]> {
    const params = new URLSearchParams();
    params.append('runtime_type', runtimeType);
    const response = await this.httpService
      .get<[]>(`${this.deploymentServiceUrl}/deployment/runtime`, { params })
      .toPromise();
    return plainToClass(clazz, response.data);
  }
}
