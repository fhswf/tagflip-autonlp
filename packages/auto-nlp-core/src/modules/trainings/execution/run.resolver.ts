import { HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { RunStatus } from 'auto-nlp-shared-js';
import { GraphQLObjectID } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { ModelsService } from '../../models/models-service';
import { TrainingService } from '../training.service';
import { Metric } from './entities/metric.entity';
import { Run } from './entities/run.entity';
import { RunService } from './run.service';

@Resolver(() => Run)
export class RunResolver {
  private readonly logger: Logger = new Logger(RunResolver.name);

  constructor(
    private readonly trainingsService: TrainingService,
    private readonly modelService: ModelsService,
    private readonly runService: RunService,
  ) {}

  @Mutation(() => Run)
  async cancelRun(@Args('runId') runId: string) {
    return await this.runService.cancelRun(runId);
  }

  @ResolveField(() => String, { name: 'status' })
  async status(@Parent() run: Run): Promise<String> {
    if (!run) return RunStatus.SCHEDULED;
    if (run?.status == RunStatus.CANCELLING) {
      return RunStatus.CANCELLING;
    }
    try {
      return (
        (await this.runService.getRun(run.runId))?.status || RunStatus.UNKNOWN
      );
    } catch (e) {
      this.logger.error(e);
      return run.status || RunStatus.UNKNOWN;
    }
  }

  @ResolveField(() => String, { name: 'dashboardUrl' })
  async dashboardUrl(@Parent() run: Run): Promise<String> {
    const runFromApi = await this.runService.getRun(run.runId);
    return runFromApi.dashboardUrl;
  }

  @ResolveField(() => Metric, { name: 'topMetricForRun', nullable: true })
  async topMetricForRun(@Parent() run: Run): Promise<Metric> {
    if (!run?.runId) return null;
    const training = run.training;

    const model = await this.modelService.findOne(training.model);
    const profile = model.profiles.filter(
      (x) => x.name === training.profileDescription.profile,
    )[0];
    if (profile.script.metrics && profile.script.metrics.length > 0)
      try {
        return await this.runService.getMetric(
          run.runId,
          profile.script.metrics[0].name,
        );
      } catch (e) {
        if (e instanceof NotFoundException) {
          return null;
        }
      }
    return null;
  }
}
