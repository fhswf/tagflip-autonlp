import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { Field, ObjectType } from '@nestjs/graphql';

import {
  ParameterDefinition as IParameterDefinition,
  Scalar,
  ScalarType,
  FiniteValues,
} from 'auto-nlp-shared-js';
import { Expose, plainToClass } from 'class-transformer';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class ParameterDefinition implements IParameterDefinition {
  @Field()
  name: string;

  @Field({ nullable: true })
  type?: ScalarType;

  @Field(() => GraphQLJSON, { nullable: true })
  choice?: FiniteValues;

  @Field(() => GraphQLJSON, { nullable: true })
  range?: [number, number];

  @Field({ nullable: true })
  regex?: string;

  @Field({ nullable: true })
  optional?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  default?: Scalar;

  @Field({ nullable: true })
  @Expose({ name: 'readable_name' })
  readableName?: string;

  @Field({ nullable: true })
  description?: string;
}

export function convertToParameterDefinitionArray(value: Scalar | Object) {
  if (!value) return null;
  const parameterNames: Set<string> = new Set();
  const parameterDefinitions: ParameterDefinition[] = [];
  if (!value) {
    throw new RuntimeException('Invalid value ' + value);
  }

  for (let [parameterName, parameterValue] of Object.entries(value)) {
    if (parameterNames.has(parameterName)) {
      throw new RuntimeException(
        `Duplicate parameter with name ${parameterName}.`,
      );
    }
    parameterNames.add(parameterName);

    let parameterDefinition: ParameterDefinition = undefined;

    if (parameterValue instanceof Object) {
      // parameter definition by object
      parameterDefinition = plainToClass(ParameterDefinition, parameterValue);
    } else {
      // parameter definition by value, without further information
      parameterDefinition = new ParameterDefinition();
      parameterDefinition.default = parameterValue;
      // @ts-ignore
      parameterDefinition.type = typeof parameterValue;
      parameterDefinition.optional = false;
    }
    parameterDefinition.name = parameterName;
    parameterDefinitions.push(parameterDefinition);
  }

  return parameterDefinitions;
}
