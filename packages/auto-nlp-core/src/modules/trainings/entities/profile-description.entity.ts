import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ScalarType } from 'auto-nlp-shared-js';
import { GraphQLJSON, GraphQLObjectID } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class ProfileDescription {
  @Field(() => GraphQLObjectID, { name: 'id' })
  _id: mongoose.Types.ObjectId;

  @Prop()
  @Field()
  profile: string;

  @Prop()
  @Field((type) => GraphQLJSON, { nullable: true })
  hyperParameters?: Map<string, ScalarType>;

  @Prop()
  @Field((type) => GraphQLJSON, { nullable: true })
  trainingParameters?: Map<string, ScalarType>;
}

export type ProfileDescriptionDocument = ProfileDescription & Document;
export const ProfileDescriptionSchema = SchemaFactory.createForClass(
  ProfileDescription,
);
