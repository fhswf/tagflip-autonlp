import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { plainToClass } from 'class-transformer';
import { DatasetProviderConfigService } from './dataset-provider-config.service';
import { DatasetProvider } from './dataset-provider.abstract';

@Injectable()
export class DatasetProvidersService implements OnModuleInit {
  private static knownProviders: Map<
    string,
    new (...args: any[]) => DatasetProvider<any>
  > = new Map();

  private static logger: Logger = new Logger(DatasetProvidersService.name);

  private readonly providerInstances: Map<string, DatasetProvider<any>>;
  private datasetProviderTypes: Map<DatasetProvider<any>, string>;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly datasetProviderConfigService: DatasetProviderConfigService,
  ) {
    this.providerInstances = new Map();
    this.datasetProviderTypes = new Map();
  }

  async onModuleInit() {
    const configuredProviders = this.datasetProviderConfigService.getConfiguredDatasetProviders();
    for (const providerName of Object.keys(configuredProviders)) {
      const providerType = configuredProviders[providerName]['type'];

      if (!DatasetProvidersService.knownProviders.has(providerType)) {
        throw new Error(
          "DatasetProvider for type '" + providerType + "' is unknown.",
        );
      }

      const providerConstructor = DatasetProvidersService.knownProviders.get(
        providerType,
      );

      DatasetProvidersService.logger.log(
        "Creating DatasetProvider for '" +
          providerName +
          "' of type '" +
          providerConstructor.name +
          "'",
      );
      const providerInstance = await this.moduleRef.create(providerConstructor);
      providerInstance.configure(
        providerName,
        plainToClass(
          providerInstance.getConfigType(),
          configuredProviders[providerName]['config'],
        ),
      );

      this.providerInstances.set(providerInstance.getName(), providerInstance);
      this.datasetProviderTypes.set(providerInstance, providerType);
    }

    console.debug(this.providerInstances);
  }

  public getDatasetProvider(name: string): DatasetProvider<any> {
    if (!this.providerInstances.has(name)) {
      throw new HttpException(
        "No DatasetProvider found for name '" + name + "'",
        HttpStatus.NOT_FOUND,
      );
    }
    return this.providerInstances.get(name);
  }

  public getDatasetProviders(): DatasetProvider<any>[] {
    return [...this.providerInstances.values()];
  }

  public getDatasetProviderNames(): string[] {
    return [...this.providerInstances.keys()];
  }

  public getDatasetProviderType(provider: DatasetProvider<any>): string {
    return this.datasetProviderTypes.get(provider);
  }

  static registerProvider(
    name: string,
    type: new (...args: any[]) => DatasetProvider<any>,
  ) {
    if (DatasetProvidersService.knownProviders.has(name)) {
      throw new Error(
        'A DatasetProvider for name "' + name + '" is already registered.',
      );
    }

    DatasetProvidersService.logger.log(
      'Adding DatasetProvider named "' + name + '" of type "' + type.name + '"',
    );
    DatasetProvidersService.knownProviders.set(name, type);
  }
}
