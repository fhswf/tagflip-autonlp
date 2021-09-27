import { TaskType } from 'auto-nlp-shared-js';
import { Dataset } from '../entities/dataset.entity';

export abstract class DatasetProvider<T> {
  private name: string;

  private config: T;

  protected constructor() {
    this.config = null;
  }

  configure(name: string, config: T): void {
    this.name = name;
    this.config = config;
  }

  getName(): string {
    return this.name;
  }

  getConfig(): T {
    return this.config;
  }

  abstract getConfigType(): new (...args: any[]) => T;

  abstract listDatasetsByTask(task: TaskType): Promise<Dataset[]>;

  abstract hasDataset(datasetName: string): Promise<boolean>;

  abstract getDataset(datasetName: string): Promise<Dataset>;
}
