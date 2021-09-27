import { DeploymentInfo, DeploymentTask } from 'auto-nlp-shared-js';

export interface DeploymentExecutionService {
  createDeployment(deployment: DeploymentTask): Promise<DeploymentInfo>;

  removeDeployment(deploymentId: string);

  getDeployment(deploymentId: string): Promise<DeploymentInfo>;

  testDeployment(deploymentId: string, input: Object): Promise<Object>;
}
