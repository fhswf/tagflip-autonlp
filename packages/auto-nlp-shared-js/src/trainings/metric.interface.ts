import { MetricDataType } from '../model';
import { MetricStep } from './metric-step.interface';

export interface Metric<ID> {
  runId: ID;
  name: string;
  lastValue?: MetricDataType;
  steps?: MetricStep[];
}
