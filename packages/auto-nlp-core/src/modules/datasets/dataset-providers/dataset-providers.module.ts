import { HttpModule, Module } from '@nestjs/common';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import { HuggingFaceSearchModule } from '../../hugging-face-search/hugging-face-search.module';
import { DatasetProviderConfigService } from './dataset-provider-config.service';
import { DatasetProviderResolver } from './dataset-provider.resolver';
import { DatasetProvidersService } from './dataset-providers.service';

const files = glob.sync(
  path.join(
    path.join(path.resolve(__dirname)),
    './**/*-dataset.provider.@(ts|js)',
  ),
);
for (const file of files) {
  if (fs.statSync(file).isFile()) import(file);
}

@Module({
  imports: [HttpModule, HuggingFaceSearchModule],
  providers: [
    DatasetProvidersService,
    DatasetProviderResolver,
    DatasetProviderConfigService,
  ],
  exports: [DatasetProvidersService],
})
export class DatasetProvidersModule {}
