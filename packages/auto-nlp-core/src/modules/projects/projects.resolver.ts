import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { TaskTypeLabel } from 'auto-nlp-shared-js';
import { GraphQLObjectID } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectService) {}

  @Mutation(() => Project)
  async createProject(
    @Args('createProjectInput') createProjectInput: CreateProjectInput,
  ) {
    return this.projectsService.create(createProjectInput);
  }

  @Query(() => [Project], { name: 'projects' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Query(() => Project, { name: 'project' })
  findOne(
    @Args('id', { type: () => GraphQLObjectID }) id: mongoose.Types.ObjectId,
  ) {
    return this.projectsService.findOne(id);
  }

  @Mutation(() => Project)
  updateProject(
    @Args('id', { type: () => GraphQLObjectID }) id: mongoose.Types.ObjectId,
    @Args('updateProjectInput') updateProjectInput: UpdateProjectInput,
  ) {
    return this.projectsService.update(id, updateProjectInput);
  }

  @Mutation(() => Project)
  removeProject(
    @Args('id', { type: () => GraphQLObjectID }) id: mongoose.Types.ObjectId,
  ) {
    return this.projectsService.remove(id);
  }

  @ResolveField(() => String, { name: 'taskTypeName' })
  async taskTypeName(@Parent() project: Project): Promise<string> {
    return TaskTypeLabel.get(project.taskType);
  }
}
