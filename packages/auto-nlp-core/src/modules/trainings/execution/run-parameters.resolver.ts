import { Logger } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { RunParameters } from './entities/run-parameters.entity';
import { RunService } from './run.service';

@Resolver(() => RunParameters)
export class RunParametersResolver {
  private readonly logger: Logger = new Logger(RunParameters.name);

  constructor(private readonly runService: RunService) {}

  @Query(() => RunParameters, { name: 'runParameters' })
  async findRunParameters(
    @Args('runId', { type: () => String }) runId: string,
  ): Promise<RunParameters> {
    return this.runService.getRunParameters(runId);
  }
}
