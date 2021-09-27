import { Field, ObjectType } from '@nestjs/graphql';
import { ModelSourceMeta as IModelSourceMeta } from 'auto-nlp-shared-js';

@ObjectType()
export class ModelSourceMeta implements IModelSourceMeta {
  @Field({ nullable: true })
  url?: string;
}
