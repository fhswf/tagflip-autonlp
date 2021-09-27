import { Field, InputType, PartialType, PickType } from '@nestjs/graphql';
import { DatasetAssignment } from '../entities/dataset-assignment.entity';
import { Project } from '../entities/project.entity';
import { UpdateDatasetAssignmentInput } from './update-dataset-assignment.input';

@InputType()
export class UpdateProjectInput extends PartialType(
  PickType(Project, ['name', 'taskType', 'description'] as const, InputType),
) {
  @Field((type) => UpdateDatasetAssignmentInput, { nullable: true })
  dataset?: DatasetAssignment;
}
