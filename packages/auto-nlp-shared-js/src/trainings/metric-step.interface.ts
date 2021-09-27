import { MetricDataType } from '../model';

export interface MetricStep {
  step: number;
  timestamp: Date;
  value: MetricDataType;
}
