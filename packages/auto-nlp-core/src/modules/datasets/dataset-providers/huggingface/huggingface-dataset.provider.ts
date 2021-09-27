import { HttpService, Injectable, Scope } from '@nestjs/common';
import { TaskType } from 'auto-nlp-shared-js';
import { HuggingFaceSearchService } from '../../../hugging-face-search/hugging-face-search.service';
import { Dataset } from '../../entities/dataset.entity';
import { DatasetProvider } from '../dataset-provider.abstract';
import { Provider } from '../dataset-provider.decorator';
import { HuggingFaceDatasetProviderConfig } from './huggingface-dataset-povider.config';

@Injectable({ scope: Scope.TRANSIENT })
@Provider('huggingface')
export class HuggingFaceDatasetProvider extends DatasetProvider<HuggingFaceDatasetProviderConfig> {
  constructor(
    private readonly httpService: HttpService,
    private readonly search: HuggingFaceSearchService,
  ) {
    super();
  }

  getConfigType(): new (...args: any[]) => HuggingFaceDatasetProviderConfig {
    return HuggingFaceDatasetProviderConfig;
  }

  listDatasetsByTask(task: TaskType): Promise<Dataset[]> {
    return this.search.listDatasetsByTask(task);
  }

  listDatasetSubsets(datasetName: string): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  async hasDataset(name: string): Promise<boolean> {
    return true;
  }

  async getDataset(name: string): Promise<Dataset> {
    return await this.search.getDataset(name);
  }
}
