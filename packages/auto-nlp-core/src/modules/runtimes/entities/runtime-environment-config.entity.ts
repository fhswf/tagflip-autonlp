import { Field, ObjectType } from '@nestjs/graphql';
import { RuntimeEnvironmentConfig as IRuntimeEnvironmentConfig } from 'auto-nlp-shared-js';
import { Transform } from 'class-transformer';
import {
  convertToParameterDefinitionArray,
  ParameterDefinition,
} from '../../../common/entities/parameter-definition.entity';

@ObjectType()
export class RuntimeEnvironment implements IRuntimeEnvironmentConfig {
  @Field({ nullable: true })
  type?: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [ParameterDefinition], { nullable: true })
  @Transform((value) => convertToParameterDefinitionArray(value.value), {
    toClassOnly: true,
  })
  parameters?: ParameterDefinition[];
}
