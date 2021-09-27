import { Metric, ParameterInfo, Run } from 'auto-nlp-shared-js';
import { TaskQueue } from './task-queue.interface';

export interface TrainingExecutorService<ID> {
  getTaskQueue(): TaskQueue<ID>;

  getRun(runId: ID): Promise<Run<ID>>;

  cancelRun(runId: ID): Promise<Run<ID>>;

  deleteRun(runId: ID): Promise<Run<ID>>;

  getMetrics(runId: ID): Promise<Metric<ID>[]>;

  getMetric(runId: ID, metric: string): Promise<Metric<ID>>;

  getRunParameters(runId: ID): Promise<ParameterInfo<ID>>;
}
