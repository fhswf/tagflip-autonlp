import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GraphQLObjectID } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class DatasetAssignment {
  @Field(() => GraphQLObjectID, { name: 'id' })
  _id: mongoose.Types.ObjectId;

  @Field()
  @Prop()
  providerName: string;

  @Field()
  @Prop()
  datasetName: string;

  @Field()
  @Prop()
  subsetName: string;
}

export type DatasetAssignmentDocument = DatasetAssignment & Document;
export const DatasetAssignmentSchema = SchemaFactory.createForClass(DatasetAssignment);
