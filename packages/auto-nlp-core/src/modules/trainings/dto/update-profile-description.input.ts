import { InputType, PickType } from '@nestjs/graphql';
import { ProfileDescription } from '../entities/profile-description.entity';
import { Training } from '../entities/training.entity';

@InputType()
export class UpdateProfileDescriptionInput extends PickType(
  ProfileDescription,
  ['profile', 'hyperParameters', 'trainingParameters'] as const,
  InputType,
) {}
