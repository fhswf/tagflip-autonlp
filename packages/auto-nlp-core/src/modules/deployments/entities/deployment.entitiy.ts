import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { GraphQLObjectID } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Project } from '../../projects/entities/project.entity';
import { RuntimeDescription } from '../../runtimes/entities/runtime-description.entity';
import { Run } from '../../trainings/execution/entities/run.entity';
import { DeploymentInfo } from './deployment-info.entity';

@Schema({ timestamps: true })
@ObjectType()
export class Deployment {
  @Field(() => GraphQLObjectID, { name: 'id' })
  _id: mongoose.Types.ObjectId;

  @Field(() => Project)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Project' })
  project: Project; // We save project for deployment too, to reduce nested reads

  @Field(() => Run)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Run' })
  run: Run;

  @Field((type) => RuntimeDescription)
  @Prop({
    type: RuntimeDescription,
    ref: 'RuntimeDescription',
  })
  runtimeDescription: RuntimeDescription;

  @Field({ nullable: true })
  @Prop({ index: true })
  deploymentId: string;

  get id() {
    return this._id;
  }
}

export type DeploymentDocument = Deployment & Document;
export const DeploymentSchema = SchemaFactory.createForClass(Deployment);
