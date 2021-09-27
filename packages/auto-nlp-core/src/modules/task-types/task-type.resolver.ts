import { Query, Resolver } from '@nestjs/graphql';
import { TaskTypeEntity } from './entities/task-type.entity';
import { TaskType, TaskTypeLabel, TaskTypeShort } from 'auto-nlp-shared-js';

@Resolver(() => TaskTypeEntity)
export class TaskTypeResolver {
  @Query(() => [TaskTypeEntity], { name: 'taskTypes' })
  findAll() {
    let entities = [];
    for (const value in TaskType) {
      let entity = new TaskTypeEntity();
      entity._id = TaskType[value];
      if (TaskTypeLabel.has(TaskType[value]))
        entity.label = TaskTypeLabel.get(TaskType[value]);
      if (TaskTypeShort.has(TaskType[value]))
        entity.short = TaskTypeShort.get(TaskType[value]);
      entities.push(entity);
    }
    return entities;
  }
}
