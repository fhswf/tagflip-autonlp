import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ModelSourceMeta } from './model-source-meta.entity';

import { ModelMeta as IModelMeta } from 'auto-nlp-shared-js';

@ObjectType()
export class ModelMeta implements IModelMeta {
  @Field({ nullable: true })
  description?: string;

  @Type(() => ModelSourceMeta)
  @Field(() => ModelSourceMeta, { nullable: true })
  source?: ModelSourceMeta;
}
