import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { DeploymentStatus } from 'auto-nlp-shared-js';
import { DeploymentInfo as IDeploymentInfo } from 'auto-nlp-shared-js';
import { Expose } from 'class-transformer';
import { Endpoint } from './endpoint.entity';

@Schema({ timestamps: true })
@ObjectType()
export class DeploymentInfo implements IDeploymentInfo {
  @Field()
  @Prop()
  @Expose({ name: 'deployment_id' })
  deploymentId: string;

  @Field()
  @Prop()
  runtime: string;

  @Field()
  status: DeploymentStatus;

  @Field({ nullable: true })
  endpoint?: Endpoint;

  @Field({ nullable: true })
  proxyEndpoint?: Endpoint;
}
