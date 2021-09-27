import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { Field, ObjectType } from '@nestjs/graphql';
import { Expose, plainToClass, Transform } from 'class-transformer';
import {
  convertToMetricDefinitionArray,
  MetricDefinition,
} from './metric-definition.entity';
import {
  convertToParameterDefinitionArray,
  ParameterDefinition,
} from '../../../../common/entities/parameter-definition.entity';

import { ModelScript as IModelScript } from 'auto-nlp-shared-js';

@ObjectType()
export class ModelScript implements IModelScript {
  @Transform(
    ({ value }) => value.replace('${GITHUB_TOKEN}', process.env.GITHUB_TOKEN),
    {
      toClassOnly: true,
    },
  )
  @Field()
  url: string;

  @Field((type) => [String], { nullable: true })
  executors?: string[];

  @Transform((value) => convertToMetricDefinitionArray(value.value), {
    toClassOnly: true,
  })
  @Field((type) => [MetricDefinition], { nullable: true })
  metrics?: MetricDefinition[];

  @Expose({ name: 'fixed-parameters' })
  @Transform((value) => convertToParameterDefinitionArray(value.value), {
    toClassOnly: true,
  })
  @Field((type) => [ParameterDefinition], { nullable: true })
  fixedParameters?: ParameterDefinition[];

  @Expose({ name: 'hyper-parameters' })
  @Transform((value) => convertToParameterDefinitionArray(value.value), {
    toClassOnly: true,
  })
  @Field((type) => [ParameterDefinition], { nullable: true })
  hyperParameters?: ParameterDefinition[];

  @Expose({ name: 'training-parameters' })
  @Transform((value) => convertToParameterDefinitionArray(value.value), {
    toClassOnly: true,
  })
  @Field((type) => [ParameterDefinition], { nullable: true })
  trainingParameters?: ParameterDefinition[];
}
