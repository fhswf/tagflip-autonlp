import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ScalarType } from 'auto-nlp-shared-js';
import { GraphQLJSON, GraphQLObjectID } from 'graphql-scalars';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Training } from '../../trainings/entities/training.entity';

@Schema({ timestamps: true })
@ObjectType()
export class RuntimeDescription {
  @Field(() => GraphQLObjectID, { name: 'id' })
  _id: mongoose.Types.ObjectId;

  @Field()
  @Prop()
  runtime: string;

  @Field((type) => GraphQLJSON, { nullable: true })
  @Prop()
  parameters?: Map<string, ScalarType>;
}

export type RuntimeDescriptionDocument = RuntimeDescription & Document;
export const RuntimeDescriptionSchema = SchemaFactory.createForClass(
  RuntimeDescription,
);
