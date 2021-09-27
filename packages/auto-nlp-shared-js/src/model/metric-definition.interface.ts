export type MetricDataType = 'float';

export enum MetricSet {
  train = 'train',
  eval = 'eval',
  test = 'test',
}

export class MetricDefinition {
  name: string;

  description: string;

  type: MetricDataType;

  set: MetricSet;

  precision?: number;
}
