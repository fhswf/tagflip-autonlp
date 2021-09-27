import { ParameterDefinition } from '../common';

export interface RuntimeEnvironmentConfig {
  type?: string;

  name: string;

  description?: string;

  parameters?: ParameterDefinition[];
}
