import { Field, ObjectType } from '@nestjs/graphql';
import { ParameterInfo as IParameterInfo } from 'auto-nlp-shared-js';
import { Expose } from 'class-transformer';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class RunParameters implements IParameterInfo<string> {
  @Expose({ name: 'run_id' })
  @Field()
  runId: string;

  @Field(() => GraphQLJSON)
  parameters: Record<string, any>;
}
