import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoEvents } from '../../common/mongo-events/mongo-events.module';
import { BaseConfigModule } from '../../config/base-config.module';
import { RuntimesModule } from '../runtimes/runtimes.module';
import { TrainingModule } from '../trainings/training.module';
import { DefaultDeploymentExecutionService } from './default-deployment-execution.service';
import { DeploymentController } from './deployment.controller';
import { DeploymentResolver } from './deployment.resolver';
import { DeploymentService } from './deployment.service';
import { Deployment, DeploymentSchema } from './entities/deployment.entitiy';
import { ProxyDeploymentController } from './proxy-deployment.controller';
import { DeploymentRuntimeEnvironmentResolver } from './runtimes/deployment-runtime-environment.resolver';
import { DeploymentRuntimeEnvironmentService } from './runtimes/deployment-runtime-environment.service';
import { ProxyDeploymentService } from './proxy-deployment.service';

@Module({
  imports: [
    CacheModule.register(),
    HttpModule,
    TrainingModule,
    RuntimesModule,
    MongooseModule.forFeatureAsync([
      {
        name: Deployment.name,
        useFactory: (events: MongoEvents) =>
          events.forSchema(Deployment.name, DeploymentSchema),
        inject: [MongoEvents],
      },
    ]),
  ],
  controllers: [DeploymentController, ProxyDeploymentController],
  providers: [
    DeploymentResolver,
    ProxyDeploymentService,
    DefaultDeploymentExecutionService,
    DeploymentService,
    DeploymentRuntimeEnvironmentService,
    DeploymentRuntimeEnvironmentResolver,
  ],
  exports: [],
})
export class DeploymentsModule {}
