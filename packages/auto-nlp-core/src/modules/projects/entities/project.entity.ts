import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TaskType } from 'auto-nlp-shared-js';
import { GraphQLObjectID } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { DatasetAssignment } from './dataset-assignment.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Project {
  @Field(() => GraphQLObjectID, { name: 'id' })
  _id: mongoose.Types.ObjectId;

  @Field()
  @Prop({ unique: true })
  name: string;

  @Field((type) => String)
  @Prop({ type: String, enum: Object.values(TaskType) })
  taskType: TaskType;

  @Field((type) => DatasetAssignment, { nullable: true })
  @Prop({
    type: DatasetAssignment,
    ref: 'DatasetAssignment',
  })
  dataset?: DatasetAssignment;

  @Field({ nullable: true })
  @Prop()
  description?: string;

  get id() {
    return this._id;
  }
}

export type ProjectDocument = Project & Document;
export const ProjectSchema = SchemaFactory.createForClass(Project);
