import { RuntimeEnvironmentConfig } from 'auto-nlp-shared-js';

export interface RuntimeEnvironmentService {
  getTypes(): Promise<string[]>;

  findByName(name: string): Promise<RuntimeEnvironmentConfig>;

  findAll(): Promise<RuntimeEnvironmentConfig[]>;

  findAllByType(runtimeType: string): Promise<RuntimeEnvironmentConfig[]>;
}
