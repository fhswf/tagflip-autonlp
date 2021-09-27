import { Field, ObjectType } from '@nestjs/graphql';
import { Endpoint as IEndpoint } from 'auto-nlp-shared-js';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class Endpoint implements IEndpoint {
  @Field()
  url: string;

  @Field(() => String)
  method: 'POST' | 'GET' | 'PUT';

  @Field(() => GraphQLJSON, { nullable: true })
  signature?: any;
}
