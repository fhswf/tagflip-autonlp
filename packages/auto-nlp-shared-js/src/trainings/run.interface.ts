import { RunStatus } from './run-status.enum';

export interface Run<ID> {
  runId: ID;

  dashboardUrl?: string;

  status?: RunStatus;
}
