import { Inject, Logger } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { DeploymentStatus } from 'auto-nlp-shared-js';
import { GraphQLJSON, GraphQLObjectID } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { PaginationArgs } from '../../common/graphql/pagination.args';
import { PUB_SUB } from '../../common/graphql/pub-sub/pub-sub.module';
import { DefaultDeploymentExecutionService } from './default-deployment-execution.service';
import { ProxyDeploymentService } from './proxy-deployment.service';
import { DeploymentService } from './deployment.service';
import { CreateDeploymentInput } from './dto/create-deployment.input';
import { UpdateDeploymentInput } from './dto/update-deployment.input';
import { DeploymentInfo } from './entities/deployment-info.entity';
import { Deployment } from './entities/deployment.entitiy';

@Resolver(() => Deployment)
export class DeploymentResolver {
  private logger: Logger = new Logger(DeploymentResolver.name);

  constructor(
    private readonly deploymentService: DeploymentService,
    private readonly proxyDeploymentService: ProxyDeploymentService,
    private readonly deploymentExecutionService: DefaultDeploymentExecutionService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) { }

  @Mutation(() => Deployment)
  createDeployment(
    @Args('createDeploymentInput') createDeploymentInput: CreateDeploymentInput,
  ) {
    return this.deploymentService.create(createDeploymentInput);
  }

  @Query(() => [Deployment], { name: 'deployments' })
  findAll(
    @Args('projectId', { type: () => GraphQLObjectID })
    projectId: mongoose.Types.ObjectId,
    @Args({ nullable: true }) paginationArgs?: PaginationArgs,
  ) {
    return this.deploymentService.findAllByProjectId(projectId, paginationArgs);
  }

  @Query(() => Int, { name: 'deploymentsCount' })
  count(
    @Args('projectId', { type: () => GraphQLObjectID })
    projectId: mongoose.Types.ObjectId,
  ) {
    return this.deploymentService.count(projectId);
  }

  @Query(() => Deployment, { name: 'deployment' })
  findOne(
    @Args('id', { type: () => GraphQLObjectID }) id: mongoose.Types.ObjectId,
  ) {
    return this.deploymentService.findOne(id);
  }

  @Query(() => GraphQLJSON, { name: 'testDeployment' })
  async testDeployment(
    @Args('id', { type: () => GraphQLObjectID }) id: mongoose.Types.ObjectId,
    @Args('input', { type: () => GraphQLJSON }) input: Object,
  ) {
    const deployment = await this.deploymentService.findOne(id);
    return await this.deploymentExecutionService.testDeployment(
      deployment.deploymentId,
      input,
    );
  }

  @Mutation(() => Deployment)
  updateDeployment(
    @Args('id', { type: () => GraphQLObjectID }) id: mongoose.Types.ObjectId,
    @Args('updateDeploymentInput') updateDeploymentInput: UpdateDeploymentInput,
  ) {
    return this.deploymentService.update(id, updateDeploymentInput);
  }

  @Mutation(() => Deployment)
  removeDeployment(
    @Args('id', { type: () => GraphQLObjectID }) id: mongoose.Types.ObjectId,
  ) {
    return this.deploymentService.remove(id);
  }

  @ResolveField(() => DeploymentInfo, { name: 'info' })
  async info(@Parent() deployment: Deployment): Promise<DeploymentInfo> {
    const deploymentId = deployment.deploymentId;
    try {
      const deploymentInfo = await this.deploymentExecutionService.getDeployment(
        deploymentId,
      );
      deploymentInfo.proxyEndpoint = await this.proxyDeploymentService.getProxyDeploymentEndpoint(
        deploymentInfo.deploymentId,
      );
      return deploymentInfo;
    } catch (e) {
      this.logger.error(e);
      return {
        deploymentId,
        runtime: deployment.runtimeDescription.runtime,
        status: DeploymentStatus.FAILED,
      };
    }
  }
}
