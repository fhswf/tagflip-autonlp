import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Metric as IMetric, MetricDataType } from 'auto-nlp-shared-js';
import { Expose, Type } from 'class-transformer';
import { GraphQLJSON } from 'graphql-scalars';
import { MetricStep } from './metric-step.entity';

@ObjectType()
export class Metric implements IMetric<string> {
  @Expose({ name: 'run_id' })
  @Field(() => ID)
  runId: string;

  @Field()
  name: string;

  @Expose({ name: 'last_value' })
  @Field(() => GraphQLJSON, { nullable: true })
  lastValue?: MetricDataType;

  @Type(() => MetricStep)
  @Field(() => [MetricStep], { nullable: true })
  steps?: MetricStep[];
}
