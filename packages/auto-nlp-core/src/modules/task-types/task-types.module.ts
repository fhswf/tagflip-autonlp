import { Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TaskType } from 'auto-nlp-shared-js';
import { TaskTypeResolver } from './task-type.resolver';

registerEnumType(TaskType, {
  name: 'TaskType',
  valuesMap: {
    Token_Classification: {
      description: 'Token Classification',
    },
    Text_Classification: {
      description: 'Text Classification',
    },
  },
  description: 'The supported task types.',
});

@Module({
  imports: [],
  providers: [TaskTypeResolver],
})
export class TaskTypesModule {}
