import { Args, Query, Resolver } from '@nestjs/graphql';
import { TaskType } from 'auto-nlp-shared-js';
import { DatasetsService } from './datasets.service';
import { Dataset } from './entities/dataset.entity';

@Resolver(() => Dataset)
export class DatasetsResolver {
  constructor(private readonly datasetsService: DatasetsService) {}

  @Query(() => [Dataset], { name: 'datasetsByType' })
  findByTaskType(
    @Args('datasetProvider') datasetProvider: string,
    @Args({ name: 'taskType', type: () => TaskType }) taskType: TaskType,
  ) {
    return this.datasetsService.listDatasetsByTask(datasetProvider, taskType);
  }
}
