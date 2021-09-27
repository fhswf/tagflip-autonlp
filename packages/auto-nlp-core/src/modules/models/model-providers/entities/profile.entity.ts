import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Profile as IProfile, TaskType } from 'auto-nlp-shared-js';
import { Expose, Transform, Type } from 'class-transformer';
import { ModelScript } from './model-script.entity';

@ObjectType()
export class Profile implements IProfile {
  @Field()
  name: string;

  @Field((type) => String)
  @Transform((value) => convertToTaskType(value.value), {
    toClassOnly: true,
  })
  @Expose({ name: 'task' })
  taskType: TaskType;

  @Field()
  description: string;

  @Field((type) => Int)
  @Expose({ name: 'default-training-minutes' })
  defaultTrainingMinutes: number;

  @Field((type) => ModelScript)
  @Type(() => ModelScript)
  script: ModelScript;
}

function convertToTaskType(value: string) {
  const taskTypeValues = Object.keys(TaskType);
  if (!taskTypeValues.includes(value))
    throw new RuntimeException(`Unsupported task ${value}.`);
  return TaskType[value];
}
