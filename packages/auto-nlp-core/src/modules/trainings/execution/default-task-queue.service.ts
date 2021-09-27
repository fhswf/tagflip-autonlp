import {
  HttpService,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IllegalArgumentException, TrainingTask } from 'auto-nlp-shared-js';
import { classToPlain, plainToClass } from 'class-transformer';
import { PendingRun } from './entities/pending-run.entity';
import { Run } from './entities/run.entity';
import { TaskQueue } from './task-queue.interface';

@Injectable()
export class DefaultTaskQueue implements TaskQueue<string> {
  private deploymentServiceUrl: string;
  private logger: Logger = new Logger(DefaultTaskQueue.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.deploymentServiceUrl = this.configService.get(
      'AUTONLP_DEPLOYMENT_URL',
    );
  }

  async enqueueTask(trainingTask: TrainingTask): Promise<PendingRun> {
    if (!trainingTask)
      throw new IllegalArgumentException(
        'Parameter trainingTask must be defined',
      );
    try {
      const response = await this.httpService
        .post<PendingRun>(
          `${this.deploymentServiceUrl}/training/queue`,
          classToPlain(trainingTask),
        )
        .toPromise();
      return plainToClass(PendingRun, response.data);
    } catch (e) {
      this.logger.error(`Could not enqueue task. ${e}`);
      throw e;
    }
  }

  async obtainRun(messageId: string): Promise<Run> {
    if (!messageId)
      throw new IllegalArgumentException('Parameter messageId must be defined');
    try {
      const response = await this.httpService
        .get<Run>(
          `${this.deploymentServiceUrl}/training/queue/${messageId}/run`,
        )
        .toPromise();
      return plainToClass(Run, response.data);
    } catch (e) {
      if (e?.response?.status === 425) {
        // Too early
        this.logger.debug(
          `Training with message ${messageId} has been enqueued, but not started yet.`,
        );
        return null;
      } else if (e?.response?.status === HttpStatus.NOT_FOUND) {
        throw new NotFoundException("Given run doesn't exist. May be lost.");
      } else {
        this.logger.error(`Could not obtain task. ${e}`);
      }
      throw e;
    }
  }
}
