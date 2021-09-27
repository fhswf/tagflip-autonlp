import { Field, InputType, PickType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { GraphQLObjectID } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { Project } from '../../projects/entities/project.entity';
import { ProfileDescription } from '../entities/profile-description.entity';
import { RuntimeDescription } from '../../runtimes/entities/runtime-description.entity';
import { Training } from '../entities/training.entity';
import { CreateProfileDescriptionInput } from './create-profile-description.input';
import { CreateRuntimeDescriptionInput } from '../../runtimes/dto/create-runtime-description.input';

@InputType()
export class CreateTrainingInput extends PickType(
  Training,
  ['earliestStartTime', 'latestEndTime', 'model'] as const,
  InputType,
) {
  @Field((type) => GraphQLObjectID)
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Project' })
  project: Project;

  @Field((type) => String)
  @Prop()
  model: string;

  @Field((type) => CreateProfileDescriptionInput)
  @Prop()
  profileDescription: ProfileDescription;

  @Field((type) => CreateRuntimeDescriptionInput)
  @Prop()
  runtimeDescription: RuntimeDescription;
}
