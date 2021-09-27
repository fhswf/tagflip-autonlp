import { InputType, PickType } from '@nestjs/graphql';
import { ProfileDescription } from '../../trainings/entities/profile-description.entity';
import { RuntimeDescription } from '../entities/runtime-description.entity';
import { Training } from '../../trainings/entities/training.entity';

@InputType()
export class CreateRuntimeDescriptionInput extends PickType(
  RuntimeDescription,
  ['runtime', 'parameters'] as const,
  InputType,
) {}
