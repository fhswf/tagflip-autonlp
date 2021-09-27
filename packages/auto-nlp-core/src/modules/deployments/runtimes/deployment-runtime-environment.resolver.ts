import { Args, Query, Resolver } from '@nestjs/graphql';
import { RuntimeEnvironment } from '../../runtimes/entities/runtime-environment-config.entity';
import { DeploymentRuntimeEnvironmentService } from './deployment-runtime-environment.service';

// const RuntimeTypeUnion = createUnionType({
//   name: 'RuntimeTypeUnion', // the name of the GraphQL union
//   types: () => _.uniq([...TypesForRuntimeType.values(), RuntimeConfig]), // function that returns tuple of object types classes
// });

@Resolver((type) => RuntimeEnvironment)
export class DeploymentRuntimeEnvironmentResolver {
  constructor(
    private readonly runtimeService: DeploymentRuntimeEnvironmentService,
  ) {}

  @Query(() => RuntimeEnvironment, {
    name: 'deploymentRuntimeEnvironmentByName',
  })
  async findByName(@Args('name') name: string) {
    return this.runtimeService.findByName(name);
  }

  @Query(() => [RuntimeEnvironment], {
    name: 'deploymentRuntimeEnvironments',
  })
  async findAll() {
    return await this.runtimeService.findAll();
  }
}
