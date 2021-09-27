import { Module } from '@nestjs/common';
import { ModelsService } from './models-service';
import { ModelProvidersModule } from './model-providers/model-providers.module';
import { ModelsResolver } from './models.resolver';

@Module({
  providers: [ModelsService, ModelsResolver],
  imports: [ModelProvidersModule],
  exports: [ModelsService],
})
export class ModelsModule {}
