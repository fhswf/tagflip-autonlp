import { DatasetProvider } from './dataset-provider.abstract';
import { DatasetProvidersService } from './dataset-providers.service';

/**
 * Declares a type being an DatasetProvider for a specific source.
 *
 * @param providerType the name of the DatasetProvider.
 * @constructor the constructor of the type.
 */
export const Provider = <
  T extends new (...args: any[]) => DatasetProvider<any>
>(
  providerType: string,
) => {
  return (constructor: T): void => {
    DatasetProvidersService.registerProvider(providerType, constructor);
  };
};
