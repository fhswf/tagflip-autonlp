import { DeploymentTask as IDeploymentTask, Scalar } from 'auto-nlp-shared-js';
import { Expose } from 'class-transformer';

export class DeploymentTask implements IDeploymentTask {
  @Expose({ name: 'run_id' })
  runId: string;

  runtime: string;

  parameters: Map<string, Scalar | Array<Scalar>>;
}
