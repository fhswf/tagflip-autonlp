import { DeploymentStatus } from './deployment-status.enum';
import { Endpoint } from './endpoint.interface';

export class DeploymentInfo {
  deploymentId: string;

  runtime: string;

  status: DeploymentStatus;

  endpoint?: Endpoint;
}
