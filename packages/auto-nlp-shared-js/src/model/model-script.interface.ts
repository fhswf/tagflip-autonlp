import { ParameterDefinition } from '../common/parameter-definition.interface';
import { MetricDefinition } from './metric-definition.interface';

export interface ModelScript {
  url: string;

  executors?: string[];

  metrics?: MetricDefinition[];

  fixedParameters?: ParameterDefinition[];

  hyperParameters?: ParameterDefinition[];

  trainingParameters?: ParameterDefinition[];
}
