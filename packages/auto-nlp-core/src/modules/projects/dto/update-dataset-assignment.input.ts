import { InputType, PartialType, PickType } from '@nestjs/graphql';
import { DatasetAssignment } from '../entities/dataset-assignment.entity';

@InputType()
export class UpdateDatasetAssignmentInput extends PartialType(
  PickType(DatasetAssignment, ['providerName', 'datasetName', , 'subsetName']),
  InputType,
) {}
