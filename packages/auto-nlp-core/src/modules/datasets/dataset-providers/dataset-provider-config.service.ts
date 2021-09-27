import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatasetProviderConfigService {
  constructor(private configService: ConfigService) {}

  getConfiguredDatasetProviders(): Record<string, any> {
    return this.configService.get('dataset-providers');
  }

  getDatasetProviderConfig(providerName: string): Record<string, any> {
    if (!this.configService.get('dataset-providers')) return null;
    return this.configService.get('dataset-providers')[providerName];
  }
}
