import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TaskType } from 'auto-nlp-shared-js';
import { plainToClass } from 'class-transformer';
import { DatasetSubset } from '../datasets/entities/dataset-subset.entity';
import { Dataset } from '../datasets/entities/dataset.entity';

@Injectable()
export class HuggingFaceSearchService {
  private huggingfaceSearchServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.huggingfaceSearchServiceUrl = configService.get(
      'AUTONLP_HF_SEARCH_SERVICE_URL',
    );
  }

  public async listDatasetsByTask(task: TaskType): Promise<Dataset[]> {
    let params = new URLSearchParams();
    params.append('task', task);
    let response = await this.httpService
      .get<object>(`${this.huggingfaceSearchServiceUrl}/datasets`, {
        params: params,
      })
      .toPromise();

    const datasets: Dataset[] = [];
    const responseObj = response.data;
    for (const datasetName of Object.keys(responseObj)) {
      datasets.push(
        Dataset.newInstance(
          datasetName,
          responseObj[datasetName].map((x) => DatasetSubset.newInstance(x)),
        ),
      );
    }
    return datasets;
  }

  public async getDataset(name: string): Promise<Dataset> {
    let response = await this.httpService
      .get<object>(`${this.huggingfaceSearchServiceUrl}/datasets/${name}`)
      .toPromise();

    const responseObj = response.data;
    const subsets = Object.keys(responseObj).map((x) =>
      DatasetSubset.newInstance(x),
    );
    return Dataset.newInstance(name, subsets);
  }
}
