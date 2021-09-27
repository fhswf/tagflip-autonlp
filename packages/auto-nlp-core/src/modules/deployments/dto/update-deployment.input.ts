import { Field, InputType, PickType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { UpdateRuntimeDescriptionInput } from '../../runtimes/dto/update-runtime-description.input';
import { RuntimeDescription } from '../../runtimes/entities/runtime-description.entity';
import { Deployment } from '../entities/deployment.entitiy';

@InputType()
export class UpdateDeploymentInput extends PickType(
  Deployment,
  [] as const,
  InputType,
) {
  @Field((type) => UpdateRuntimeDescriptionInput)
  @Prop()
  runtimeDescription: RuntimeDescription;
}
