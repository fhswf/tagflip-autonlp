import {
  CacheInterceptor,
  HttpService,
  HttpStatus,
  Injectable,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IllegalArgumentException } from 'auto-nlp-shared-js';
import { plainToClass } from 'class-transformer';
import { DefaultTaskQueue } from './default-task-queue.service';
import { Metric } from './entities/metric.entity';
import { RunParameters } from './entities/run-parameters.entity';
import { Run } from './entities/run.entity';
import { TrainingExecutorService as ITrainingExecutorService } from './run-execution-service.interface';
import { RunNotStoppableException } from './run-not-stoppable.exception';
import { TaskQueue } from './task-queue.interface';

@Injectable()
export class DefaultRunExecutionService
  implements ITrainingExecutorService<string> {
  private deploymentServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly taskQueue: DefaultTaskQueue,
  ) {
    this.deploymentServiceUrl = this.configService.get(
      'AUTONLP_DEPLOYMENT_URL',
    );
  }

  getTaskQueue(): TaskQueue<string> {
    return this.taskQueue;
  }

  async cancelRun(runId: string): Promise<Run> {
    if (!runId)
      throw new IllegalArgumentException('Parameter runId must be defined');

    return this.httpService
      .delete(`${this.deploymentServiceUrl}/training/run/${runId}/cancel`)
      .toPromise()
      .then((response) => {
        return this.getRun(runId);
      })
      .catch((e) => {
        if (e.response.status == HttpStatus.NOT_FOUND) {
          return null;
        }
        if (e.response.status >= 300) {
          throw new RunNotStoppableException('Training could not be stopped');
        }
      });
  }

  deleteRun(runId: string): Promise<Run> {
    if (!runId)
      throw new IllegalArgumentException('Parameter runId must be defined');
    const run = this.getRun(runId);
    return this.httpService
      .delete(`${this.deploymentServiceUrl}/training/run/${runId}/delete`)
      .toPromise()
      .then((response) => {
        return run;
      })
      .catch((e) => {
        if (e.response.status == HttpStatus.NOT_FOUND) {
          return null;
        }
        if (e.response.status >= 300) {
          throw new RunNotStoppableException('Training could not be stopped');
        }
      });
  }

  @UseInterceptors(CacheInterceptor)
  async getRun(runId: string): Promise<Run> {
    if (!runId)
      throw new IllegalArgumentException('Parameter runId must be defined');

    const response = await this.httpService
      .get(`${this.deploymentServiceUrl}/training/run/${runId}`)
      .toPromise();
    if (response.status == HttpStatus.NOT_FOUND) {
      throw new NotFoundException();
    }

    return plainToClass(Run, response.data);
  }

  @UseInterceptors(CacheInterceptor)
  async getMetrics(runId: string): Promise<Metric[]> {
    if (!runId)
      throw new IllegalArgumentException('Parameter runId must be defined');

    const response = await this.httpService
      .get<[]>(`${this.deploymentServiceUrl}/training/run/${runId}/metric`)
      .toPromise();
    if (response.status == HttpStatus.NOT_FOUND) {
      throw new NotFoundException();
    }

    return plainToClass(Metric, response.data);
  }

  @UseInterceptors(CacheInterceptor)
  async getMetric(runId: string, metric: string): Promise<Metric> {
    if (!runId)
      throw new IllegalArgumentException('Parameter runId must be defined');
    if (!metric)
      throw new IllegalArgumentException('Parameter metric must be defined');

    try {
      const response = await this.httpService
        .get(
          `${this.deploymentServiceUrl}/training/run/${runId}/metric/${metric}`,
        )
        .toPromise();
      return plainToClass(Metric, response.data);
    } catch (e) {
      if (e.response.status == HttpStatus.NOT_FOUND) {
        throw new NotFoundException();
      }
    }
  }

  @UseInterceptors(CacheInterceptor)
  async getRunParameters(runId: string): Promise<RunParameters> {
    if (!runId)
      throw new IllegalArgumentException('Parameter runId must be defined');
    try {
      const response = await this.httpService
        .get(`${this.deploymentServiceUrl}/training/run/${runId}/parameter`)
        .toPromise();
      return plainToClass(RunParameters, response.data);
    } catch (e) {
      if (e.response.status == HttpStatus.NOT_FOUND) {
        throw new NotFoundException();
      }
    }
  }
}
