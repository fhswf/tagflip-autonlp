import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Model as IModel } from 'auto-nlp-shared-js';
import { Expose, Transform, Type } from 'class-transformer';
import { createHash } from 'crypto';
import { TaskType } from 'auto-nlp-shared-js';
import { ModelMeta } from './model-meta.entity';
import { Profile } from './profile.entity';

@ObjectType()
export class Model implements IModel {
  @Field()
  name: string;

  @Field((type) => ModelMeta, { nullable: true })
  @Type(() => ModelMeta)
  meta?: ModelMeta;

  @Field((type) => [String])
  languages: string[];

  @Field((type) => [Profile])
  @Type(() => Profile)
  profiles: Profile[];

  @Field(() => ID)
  public get id() {
    return createHash('sha1').update(this.name).digest('hex');
  }
}
