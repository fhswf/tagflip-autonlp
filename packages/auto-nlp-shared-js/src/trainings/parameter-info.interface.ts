export interface ParameterInfo<ID> {
  runId: ID;
  parameters: Record<string, any>;
}
