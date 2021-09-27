import { InputType, PickType } from '@nestjs/graphql';
import { Project } from '../entities/project.entity';

@InputType()
export class CreateProjectInput extends PickType(
  Project,
  ['name', 'taskType', 'description'] as const,
  InputType,
) {}
