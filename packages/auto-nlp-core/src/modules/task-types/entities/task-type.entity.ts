import { Field, ID, ObjectType } from '@nestjs/graphql';
import { TaskType } from 'auto-nlp-shared-js';

@ObjectType()
export class TaskTypeEntity {
  @Field((type) => ID, { name: 'id' })
  _id: TaskType;

  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  short?: string;
}
