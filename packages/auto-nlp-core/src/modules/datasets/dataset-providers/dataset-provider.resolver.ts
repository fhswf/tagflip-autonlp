import { Query, Resolver } from '@nestjs/graphql';
import { DatasetProvidersService } from './dataset-providers.service';

@Resolver()
export class DatasetProviderResolver {
  constructor(
    private readonly datasetProvidersService: DatasetProvidersService,
  ) {}

  @Query(() => [String], { name: 'datasetProviders' })
  listDatasetProviders() {
    return this.datasetProvidersService.getDatasetProviderNames();
  }
}
