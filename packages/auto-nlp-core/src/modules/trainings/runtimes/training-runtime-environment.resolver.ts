import { Args, Query, Resolver } from '@nestjs/graphql';
import { RuntimeEnvironment } from '../../runtimes/entities/runtime-environment-config.entity';
// import * as _ from 'lodash';
import { TrainingRuntimeEnvironmentService } from './training-runtime-environment.service';

// const RuntimeTypeUnion = createUnionType({
//   name: 'RuntimeTypeUnion', // the name of the GraphQL union
//   types: () => _.uniq([...TypesForRuntimeType.values(), RuntimeConfig]), // function that returns tuple of object types classes
// });

@Resolver((type) => RuntimeEnvironment)
export class TrainingRuntimeEnvironmentResolver {
  constructor(
    private readonly runtimeService: TrainingRuntimeEnvironmentService,
  ) {}

  @Query(() => RuntimeEnvironment, {
    name: 'trainingRuntimeEnvironmentByName',
  })
  async findByName(@Args('name') name: string) {
    return this.runtimeService.findByName(name);
  }

  @Query(() => [RuntimeEnvironment], {
    name: 'trainingRuntimeEnvironments',
  })
  async findAll() {
    return await this.runtimeService.findAll();
  }
}
