import { CacheModule, forwardRef, HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseConfigModule } from '../../config/base-config.module';
import { DeploymentsModule } from '../deployments/deployments.module';
import { ModelProvidersModule } from '../models/model-providers/model-providers.module';
import { ModelsModule } from '../models/models.module';
import { ProjectsModule } from '../projects/projects.module';
import {
  RuntimeDescription,
  RuntimeDescriptionSchema,
} from './entities/runtime-description.entity';

@Module({
  imports: [
    CacheModule.register(),
    HttpModule,
    ModelsModule,
    ProjectsModule,
    ModelProvidersModule,
    forwardRef(() => DeploymentsModule),
    MongooseModule.forFeatureAsync([
      {
        name: RuntimeDescription.name,
        useFactory: () => RuntimeDescriptionSchema,
      },
    ]),
    ModelsModule,
  ],
  exports: [],
})
export class RuntimesModule {}
