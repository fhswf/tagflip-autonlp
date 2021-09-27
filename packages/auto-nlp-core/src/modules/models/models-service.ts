import { Injectable } from '@nestjs/common';
import { TaskType } from 'auto-nlp-shared-js';
import { DefaultModelProviderService } from './model-providers/default-model-provider/default-model-provider.service';
import { Model } from './model-providers/entities/model.entity';
import { ModelProvider } from './model-providers/model-provider.interface';

/**
 * This service retrieves models from different model providers.
 */
@Injectable()
export class ModelsService implements ModelProvider {
  constructor(
    private readonly defaultModelProvider: DefaultModelProviderService,
  ) {}

  findOne(id: string): Model {
    return this.defaultModelProvider.findOne(id);
  }

  findByTask(task: TaskType): Model[] {
    return this.defaultModelProvider
      .findAll()
      .filter((x) => x.profiles.map((x) => x.taskType).includes(task));
  }

  findAll(): Model[] {
    return this.defaultModelProvider.findAll();
  }
}
