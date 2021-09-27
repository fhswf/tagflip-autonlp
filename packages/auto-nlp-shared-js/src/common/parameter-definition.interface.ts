export type ScalarType = 'string' | 'int' | 'float' | 'number' | 'boolean';

export type Scalar = string | number | boolean | ScalarType;

export type FiniteValues = Array<Scalar>;

export interface ParameterDefinition {
  name: string;

  type?: ScalarType;

  choice?: FiniteValues;

  range?: [number, number];

  regex?: string;

  optional?: boolean;

  default?: Scalar | Array<Scalar>;

  readableName?: string;

  description?: string;
}
