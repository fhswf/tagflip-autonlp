import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  MetricDataType,
  MetricDefinition as IMetricDefinition,
  MetricSet,
} from 'auto-nlp-shared-js';
import { plainToClass } from 'class-transformer';

@ObjectType()
export class MetricDefinition implements IMetricDefinition {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  type: MetricDataType;

  @Field()
  set: MetricSet;

  @Field((type) => Int, { nullable: true })
  precision?: number;
}

export function convertToMetricDefinitionArray(value) {
  if (!value) return null;
  const metricNames: Set<string> = new Set();
  const metricDefinitions: MetricDefinition[] = [];
  if (!value) {
    throw new RuntimeException('Invalid value ' + value);
  }

  for (let [metricName, metricValue] of Object.entries(value)) {
    if (metricNames.has(metricName)) {
      throw new RuntimeException(`Duplicate metric with name ${metricName}.`);
    }
    metricNames.add(metricName);
    const metricDefinition = plainToClass(MetricDefinition, metricValue);
    metricDefinition.name = metricName;
    metricDefinitions.push(metricDefinition);
  }

  return metricDefinitions;
}
