import { Injectable, NotFoundException } from '@nestjs/common';
import * as appRoot from 'app-root-path';
import { plainToClass } from 'class-transformer';
import * as path from 'path';

import { loadYaml } from '../../../../util/helper/yaml.helper';
import { Model } from '../entities/model.entity';
import { ModelProvider } from '../model-provider.interface';

@Injectable()
export class DefaultModelProviderService implements ModelProvider {
  private readonly models: Map<string, Model>;

  constructor() {
    const model_file = path.resolve(
      path.join(appRoot.toString(), './config'),
      './models.yaml',
    );
    const yaml = loadYaml(model_file);
    const modelArray: Model[] = plainToClass(Model, yaml['models'] as any[]);
    this.models = new Map(modelArray.map((x) => [x.id, x]));
  }

  findAll(): Model[] {
    return [...this.models.values()];
  }

  findOne(id: string): Model {
    if (!this.models.has(id)) {
      throw new NotFoundException("No model found for name '" + id + "'");
    }
    return this.models.get(id);
  }
}
