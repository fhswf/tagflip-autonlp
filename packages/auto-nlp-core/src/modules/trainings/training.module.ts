import { CacheModule, forwardRef, HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoEvents } from '../../common/mongo-events/mongo-events.module';
import { BaseConfigModule } from '../../config/base-config.module';
import { DeploymentsModule } from '../deployments/deployments.module';
import { ModelProvidersModule } from '../models/model-providers/model-providers.module';
import { ModelsModule } from '../models/models.module';
import { ProjectsModule } from '../projects/projects.module';
import {
  RuntimeDescription,
  RuntimeDescriptionSchema,
} from '../runtimes/entities/runtime-description.entity';
import { RuntimesModule } from '../runtimes/runtimes.module';
import {
  ProfileDescription,
  ProfileDescriptionSchema,
} from './entities/profile-description.entity';
import { Training, TrainingSchema } from './entities/training.entity';
import { DefaultRunExecutionService } from './execution/default-run-execution.service';
import { DefaultTaskQueue } from './execution/default-task-queue.service';
import { Run, RunSchema } from './execution/entities/run.entity';
import { MetricResolver } from './execution/metric.resolver';
import { RunParametersResolver } from './execution/run-parameters.resolver';
import { RunResolver } from './execution/run.resolver';
import { RunService } from './execution/run.service';
import { TrainingRuntimeEnvironmentResolver } from './runtimes/training-runtime-environment.resolver';
import { TrainingRuntimeEnvironmentService } from './runtimes/training-runtime-environment.service';
import { TrainingResolver } from './training.resolver';
import { TrainingService } from './training.service';

@Module({
  imports: [
    CacheModule.register(),
    HttpModule,
    ModelsModule,
    ProjectsModule,
    ModelProvidersModule,
    forwardRef(() => DeploymentsModule),
    RuntimesModule,
    MongooseModule.forFeatureAsync([
      {
        name: Training.name,
        useFactory: (events: MongoEvents) =>
          events.forSchema(Training.name, TrainingSchema),
        inject: [MongoEvents],
      },
      {
        name: RuntimeDescription.name,
        useFactory: () => RuntimeDescriptionSchema,
      },
      {
        name: ProfileDescription.name,
        useFactory: () => ProfileDescriptionSchema,
      },
      {
        name: Run.name,
        useFactory: () => RunSchema,
      },
    ]),
    ModelsModule,
  ],
  providers: [
    TrainingRuntimeEnvironmentService,
    TrainingRuntimeEnvironmentResolver,
    RunService,
    DefaultTaskQueue,
    DefaultRunExecutionService,
    TrainingService,
    TrainingResolver,
    RunResolver,
    MetricResolver,
    RunParametersResolver,
  ],
  exports: [TrainingService, RunService],
})
export class TrainingModule {}
