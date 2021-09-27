import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Run as IRun, RunStatus, statusForName } from 'auto-nlp-shared-js';
import { Expose, Transform } from 'class-transformer';
import { GraphQLObjectID } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Project } from '../../../projects/entities/project.entity';
import { Training } from '../../entities/training.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Run implements IRun<string> {
  @Field(() => GraphQLObjectID, { name: 'id' })
  _id: mongoose.Types.ObjectId;

  @Field((type) => String)
  @Expose({ name: 'run_id' })
  @Prop({ index: true })
  runId: string;

  @Expose({ name: 'status' })
  @Transform((value) => statusForName(value.value))
  @Field((type) => RunStatus, { nullable: true })
  @Prop()
  status?: RunStatus;

  @Expose({ name: 'dashboard_url' })
  @Field({ nullable: true })
  dashboardUrl?: string;

  @Field(() => Project)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project' })
  project?: Project;

  @Field(() => Training, { nullable: true })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Training' })
  training?: Training;

  get id() {
    return this._id;
  }
}

registerEnumType(RunStatus, {
  name: 'RunStatus',
});

export type RunDocument = Run & Document;
export const RunSchema = SchemaFactory.createForClass(Run);
