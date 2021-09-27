import { InputType, PartialType } from '@nestjs/graphql';
import { Run } from '../entities/run.entity';

@InputType()
export class UpdateRunInput extends PartialType(Run, InputType) {}
