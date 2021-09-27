import { Args, Query, Resolver } from '@nestjs/graphql';
import { TaskType } from 'auto-nlp-shared-js';
import { Model } from './model-providers/entities/model.entity';
import { ModelsService } from './models-service';

@Resolver(() => Model)
export class ModelsResolver {
  constructor(private readonly modelsService: ModelsService) {}

  @Query(() => [Model], { name: 'models' })
  findAll() {
    return this.modelsService.findAll();
  }

  @Query(() => [Model], { name: 'modelsByTask' })
  findByTask(@Args('taskType', { type: () => TaskType }) taskType: TaskType) {
    return this.modelsService.findByTask(taskType);
  }

  @Query(() => Model, { name: 'model' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.modelsService.findOne(id);
  }
}
