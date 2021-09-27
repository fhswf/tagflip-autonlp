import { PendingRun, Run, TrainingTask } from 'auto-nlp-shared-js';

export interface TaskQueue<ID> {
  enqueueTask(trainingTask: TrainingTask): Promise<PendingRun>;

  obtainRun(messageId: string): Promise<Run<ID>>;
}
