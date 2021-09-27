import { Module } from '@nestjs/common';
import { DefaultModelProviderService } from './default-model-provider/default-model-provider.service';

@Module({
  providers: [DefaultModelProviderService],
  exports: [DefaultModelProviderService],
})
export class ModelProvidersModule {}
