import { Scalar } from '../common';

export interface TrainingTask {
  projectId: string;
  trainingId: string;
  scriptUrl: string;
  parameters: Map<string, Scalar | Array<Scalar>>;
  runtime: string;
  runtimeParameters: Map<string, Scalar | Array<Scalar>>;
}
