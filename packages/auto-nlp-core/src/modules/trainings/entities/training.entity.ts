import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GraphQLObjectID } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Project } from '../../projects/entities/project.entity';
import { RuntimeDescription } from '../../runtimes/entities/runtime-description.entity';
import { ProfileDescription } from './profile-description.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Training {
  @Field(() => GraphQLObjectID, { name: 'id' })
  _id: mongoose.Types.ObjectId;

  @Field(() => Project)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project' })
  project: Project;

  @Field(() => Date)
  @Prop()
  earliestStartTime: Date;

  @Field(() => Date)
  @Prop()
  latestEndTime: Date;

  @Prop()
  model: string;

  @Prop({ default: false })
  deleted: boolean;

  @Field((type) => ProfileDescription)
  @Prop({
    type: ProfileDescription,
    ref: 'ProfileDescription',
  })
  profileDescription: ProfileDescription;

  @Field((type) => RuntimeDescription)
  @Prop({
    type: RuntimeDescription,
    ref: 'RuntimeDescription',
  })
  runtimeDescription: RuntimeDescription;

  @Field((type) => String, { nullable: true })
  @Prop()
  queueMessageId?: string;

  get id() {
    return this._id;
  }
}

export type TrainingDocument = Training & Document;
export const TrainingSchema = SchemaFactory.createForClass(Training);
