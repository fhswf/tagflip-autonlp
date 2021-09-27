import { Logger } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Metric } from './entities/metric.entity';
import { RunService } from './run.service';

@Resolver(() => Metric)
export class MetricResolver {
  private readonly logger: Logger = new Logger(MetricResolver.name);

  constructor(private readonly trainingRunService: RunService) {}

  @Query(() => [Metric], { name: 'metricsForRun' })
  async metricsForRun(
    @Args('runId', { type: () => String }) runId: string,
  ): Promise<Metric[]> {
    return this.trainingRunService.getMetrics(runId);
  }

  @Query(() => Metric, { name: 'metricForRun' })
  async metricForRun(
    @Args('runId', { type: () => String }) runId: string,
    @Args('metric', { type: () => String }) metric: string,
  ): Promise<Metric> {
    return this.trainingRunService.getMetric(runId, metric);
  }
}
