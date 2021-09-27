import { DatasetSubset } from './dataset-subset.interface';

export interface Dataset {
  id: any;

  name: string;

  subsets?: DatasetSubset[];

  providerName?: string;

  providerType?: string;
}
