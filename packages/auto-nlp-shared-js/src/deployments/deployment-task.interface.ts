import { Scalar } from '../common';

export class DeploymentTask {
  runId: string;
  runtime: string;
  parameters: Map<string, Scalar | Array<Scalar>>;
}
