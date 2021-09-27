import { Field, ObjectType } from '@nestjs/graphql';
import { MetricDataType, MetricStep as IMetricStep } from 'auto-nlp-shared-js';
import { Type } from 'class-transformer';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class MetricStep implements IMetricStep {
  @Field()
  step: number;

  @Type(() => Date)
  @Field(() => Date)
  timestamp: Date;

  @Field(() => GraphQLJSON)
  value: MetricDataType;
}
