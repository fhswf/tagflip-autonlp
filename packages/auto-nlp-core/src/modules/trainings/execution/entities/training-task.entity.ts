import { Scalar, TrainingTask as ITrainingTask } from 'auto-nlp-shared-js';
import { Expose } from 'class-transformer';

export class TrainingTask implements ITrainingTask {
  @Expose({ name: 'project_id' })
  projectId: string;

  @Expose({ name: 'training_id' })
  trainingId: string;

  @Expose({ name: 'script_url' })
  scriptUrl: string;

  parameters: Map<string, Scalar | Array<Scalar>>;

  runtime: string;

  @Expose({ name: 'runtime_parameters' })
  runtimeParameters: Map<string, Scalar | Array<Scalar>>;
}
