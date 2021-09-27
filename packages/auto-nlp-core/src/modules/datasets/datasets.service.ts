import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TaskType } from 'auto-nlp-shared-js';
import { DatasetProvider } from './dataset-providers/dataset-provider.abstract';
import { DatasetProvidersService } from './dataset-providers/dataset-providers.service';
import { Dataset } from './entities/dataset.entity';

@Injectable()
export class DatasetsService {
  constructor(
    private readonly datasetProviderService: DatasetProvidersService,
  ) {}

  async listDatasetProviders(): Promise<string[]> {
    return this.datasetProviderService.getDatasetProviderNames();
  }

  async listDatasetsByTask(
    providerName: string,
    task: TaskType,
  ): Promise<Dataset[]> {
    const provider = this.datasetProviderService.getDatasetProvider(
      providerName,
    );
    return (await provider.listDatasetsByTask(task)).map((x) =>
      this.buildDataset(x, provider),
    );
  }

  async getDataset(
    datasetProvider: string,
    datasetName: string,
  ): Promise<Dataset> {
    const provider = this.datasetProviderService.getDatasetProvider(
      datasetProvider,
    );
    if (!(await provider.hasDataset(datasetName))) {
      throw new HttpException(
        "Dataset '" +
          datasetName +
          "' could not be found by DatasetProvider '" +
          provider.getName() +
          "'.",
        HttpStatus.NOT_FOUND,
      );
    }

    return this.buildDataset(await provider.getDataset(datasetName), provider);
  }

  private buildDataset(
    dataset: Dataset,
    provider: DatasetProvider<any>,
  ): Dataset {
    dataset.providerName = provider.getName();
    dataset.providerType = this.datasetProviderService.getDatasetProviderType(
      provider,
    );
    return dataset;
  }
}
