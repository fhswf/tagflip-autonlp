import { forwardRef, Inject } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLObjectID } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { PaginationArgs } from '../../common/graphql/pagination.args';
import { DefaultModelProviderService } from '../models/model-providers/default-model-provider/default-model-provider.service';
import { Model } from '../models/model-providers/entities/model.entity';
import { CreateTrainingInput } from './dto/create-training.input';
import { UpdateTrainingInput } from './dto/update-training.input';
import { Training } from './entities/training.entity';
import { Run } from './execution/entities/run.entity';
import { RunService } from './execution/run.service';
import { TrainingService } from './training.service';

@Resolver(() => Training)
export class TrainingResolver {
  constructor(
    private readonly trainingsService: TrainingService,
    @Inject(forwardRef(() => RunService))
    private readonly runService: RunService,
    private readonly modelService: DefaultModelProviderService,
  ) {}

  @Mutation(() => Training)
  createTraining(
    @Args('createTrainingInput') createTrainingInput: CreateTrainingInput,
  ) {
    return this.trainingsService.create(createTrainingInput);
  }

  @Query(() => [Training], { name: 'trainings' })
  findAll(
    @Args('projectId', { type: () => GraphQLObjectID })
    projectId: mongoose.Types.ObjectId,
    @Args({ nullable: true }) paginationArgs?: PaginationArgs,
  ) {
    return this.trainingsService.findAll(projectId, paginationArgs);
  }

  @Query(() => Int, { name: 'trainingsCount' })
  count(
    @Args('projectId', { type: () => GraphQLObjectID })
    projectId: mongoose.Types.ObjectId,
  ) {
    return this.trainingsService.count(projectId);
  }

  @Query(() => Training, { name: 'training' })
  findOne(
    @Args('id', { type: () => GraphQLObjectID }) id: mongoose.Types.ObjectId,
  ) {
    return this.trainingsService.findOne(id);
  }

  @Mutation(() => Training)
  updateTraining(
    @Args('id', { type: () => GraphQLObjectID }) id: mongoose.Types.ObjectId,
    @Args('updateTrainingInput') updateTrainingInput: UpdateTrainingInput,
  ) {
    return this.trainingsService.update(id, updateTrainingInput);
  }

  @Mutation(() => Training)
  async removeTrainingSoft(
    @Args('id', { type: () => GraphQLObjectID }) id: mongoose.Types.ObjectId,
  ) {
    return this.trainingsService.removeSoft(id);
  }

  @Mutation(() => Training)
  removeTraining(
    @Args('id', { type: () => GraphQLObjectID }) id: mongoose.Types.ObjectId,
  ) {
    return this.trainingsService.remove(id);
  }

  @ResolveField(() => Model, { name: 'model' })
  async model(@Parent() training: Training): Promise<Model> {
    return this.modelService.findOne(training.model);
  }

  @ResolveField(() => Run, { name: 'run', nullable: true })
  async run(@Parent() training: Training): Promise<Run> {
    return await this.runService.findByTrainingId(training.id);
  }
}
