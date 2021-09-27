import { HttpModule, Module } from '@nestjs/common';
import { BaseConfigModule } from '../../config/base-config.module';
import { HuggingFaceSearchService } from './hugging-face-search.service';

@Module({
  imports: [HttpModule],
  providers: [HuggingFaceSearchService],
  exports: [HuggingFaceSearchService],
})
export class HuggingFaceSearchModule {}
