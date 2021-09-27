import { DownloadConfiguration } from './download-configuration.interface';
import { Feature } from './feature.interface';
import { Split } from './split.interface';

export interface DatasetSubset {
  id: any;

  name: string;

  description?: string;

  version?: string;

  features?: Map<string, Feature>;

  splits?: Map<string, Split>;

  homepage?: string;

  license?: string;

  download?: DownloadConfiguration;
}
