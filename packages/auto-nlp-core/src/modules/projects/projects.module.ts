import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoEvents } from '../../common/mongo-events/mongo-events.module';
import { BaseConfigModule } from '../../config/base-config.module';
import {
  DatasetAssignment,
  DatasetAssignmentSchema,
} from './entities/dataset-assignment.entity';
import { Project, ProjectSchema } from './entities/project.entity';
import { TaskTypeResolver } from '../task-types/task-type.resolver';
import { ProjectsResolver } from './projects.resolver';
import { ProjectService } from './project.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeatureAsync([
      {
        name: Project.name,
        useFactory: (events: MongoEvents) =>
          events.forSchema(Project.name, ProjectSchema),
        inject: [MongoEvents],
      },
      {
        name: DatasetAssignment.name,
        useFactory: (events: MongoEvents) =>
          events.forSchema(DatasetAssignment.name, DatasetAssignmentSchema),
        inject: [MongoEvents],
      },
    ]),
  ],
  providers: [ProjectsResolver, TaskTypeResolver, ProjectService],
  exports: [ProjectService],
})
export class ProjectsModule {}
