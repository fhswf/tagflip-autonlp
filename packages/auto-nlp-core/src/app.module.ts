import {
  HttpModule,
  HttpService,
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
//import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { PubSubModule } from './common/graphql/pub-sub/pub-sub.module';
import { MongoEventsModule } from './common/mongo-events/mongo-events.module';
import { BaseConfigModule } from './config/base-config.module';
import { DatasetsModule } from './modules/datasets/datasets.module';
import { DeploymentsModule } from './modules/deployments/deployments.module';
import { HuggingFaceSearchModule } from './modules/hugging-face-search/hugging-face-search.module';
import { ModelsModule } from './modules/models/models.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TaskTypesModule } from './modules/task-types/task-types.module';
import { TrainingModule } from './modules/trainings/training.module';
import { DatabaseModule } from './providers/database/database.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PubSubModule,
    MongoEventsModule,
    DatabaseModule,
    BaseConfigModule,
    TaskTypesModule,
    TrainingModule,
    DeploymentsModule,
    ProjectsModule,
    ModelsModule,
    DatasetsModule,
    HuggingFaceSearchModule,
    HttpModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: path.join(process.cwd(), 'src/schema.gql'),
      installSubscriptionHandlers: true,
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly httpService: HttpService) { }

  onModuleInit() {
    const axios = this.httpService.axiosRef;
    const logger: Logger = new Logger(HttpService.name + 'Request-Interceptor');
    axios.interceptors.request.use((config) => {
      logger.debug('Calling ' + axios.getUri(config));
      return config;
    });
  }
}
