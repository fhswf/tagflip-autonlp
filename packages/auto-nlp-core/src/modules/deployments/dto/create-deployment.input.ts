import { Field, InputType, PickType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { GraphQLObjectID } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { CreateRuntimeDescriptionInput } from '../../runtimes/dto/create-runtime-description.input';
import { Training } from '../../trainings/entities/training.entity';
import { Deployment } from '../entities/deployment.entitiy';

@InputType()
export class CreateDeploymentInput extends PickType(
  Deployment,
  [] as const,
  InputType,
) {
  @Field((type) => GraphQLObjectID)
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Run' })
  run: mongoose.Types.ObjectId;

  @Field((type) => CreateRuntimeDescriptionInput)
  @Prop()
  runtimeDescription: CreateRuntimeDescriptionInput;
}
