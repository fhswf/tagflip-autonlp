import { Module } from '@nestjs/common';
import { DatasetProvidersModule } from './dataset-providers/dataset-providers.module';
import { DatasetsController } from './datasets.controller';
import { DatasetsService } from './datasets.service';
import { DatasetsResolver } from './datasets.resolver';
@Module({
  imports: [DatasetProvidersModule],
  controllers: [DatasetsController],
  providers: [DatasetsService, DatasetsResolver],
})
export class DatasetsModule {}
