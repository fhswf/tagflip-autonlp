import { InputType, PickType } from '@nestjs/graphql';
import { Run } from '../entities/run.entity';

@InputType()
export class CreateRunInput extends PickType(
  Run,
  ['training', 'runId', 'status'] as const,
  InputType,
) {}
