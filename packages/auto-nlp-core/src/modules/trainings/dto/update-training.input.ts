import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { ProfileDescription } from '../entities/profile-description.entity';
import { RuntimeDescription } from '../../runtimes/entities/runtime-description.entity';
import { Training } from '../entities/training.entity';
import { CreateProfileDescriptionInput } from './create-profile-description.input';
import { CreateRuntimeDescriptionInput } from '../../runtimes/dto/create-runtime-description.input';
import { UpdateProfileDescriptionInput } from './update-profile-description.input';
import { UpdateRuntimeDescriptionInput } from '../../runtimes/dto/update-runtime-description.input';

@InputType()
export class UpdateTrainingInput extends PartialType(
  PickType(
    Training,
    ['earliestStartTime', 'latestEndTime', 'model'] as const,
    InputType,
  ),
) {
  @Field((type) => UpdateProfileDescriptionInput)
  @Prop()
  profileDescription: ProfileDescription;

  @Field((type) => UpdateRuntimeDescriptionInput)
  @Prop()
  runtimeDescription: RuntimeDescription;
}
