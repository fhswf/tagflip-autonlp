import {
  CacheInterceptor,
  CacheTTL,
  Injectable,
  Logger,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  IllegalArgumentException,
  PendingRun as IPendingRun,
  RunStatus,
  Scalar,
} from 'auto-nlp-shared-js';
import { classToClassFromExist } from 'class-transformer';
import moment from 'moment';
import mongoose, { Model } from 'mongoose';
import { ParameterDefinition } from '../../../common/entities/parameter-definition.entity';
import { MongoPostRemoveEvent } from '../../../common/mongo-events/mongo-events.module';
import { Environment } from '../../../config/environment.class';
import { throwError } from '../../../util/error.helper';
import { Profile } from '../../models/model-providers/entities/profile.entity';
import { ModelsService } from '../../models/models-service';
import { ProjectDocument } from '../../projects/entities/project.entity';
import { ProjectService } from '../../projects/project.service';
import { Training, TrainingDocument } from '../entities/training.entity';
import { TrainingRuntimeEnvironmentService } from '../runtimes/training-runtime-environment.service';
import { TrainingService } from '../training.service';
import { DefaultRunExecutionService } from './default-run-execution.service';
import { UpdateRunInput } from './dto/update-run.input';
import { Metric } from './entities/metric.entity';
import { RunParameters } from './entities/run-parameters.entity';
import { Run, RunDocument } from './entities/run.entity';
import { TrainingTask } from './entities/training-task.entity';

@Injectable()
export class RunService {
  private readonly logger = new Logger(RunService.name);

  private readonly startingTrainings = new Set<string>();

  constructor(
    private readonly defaultRemoteRunService: DefaultRunExecutionService,
    private readonly environment: Environment,
    private readonly trainingService: TrainingService,
    private readonly projectService: ProjectService,
    private readonly runtimeService: TrainingRuntimeEnvironmentService,
    private readonly modelsService: ModelsService,
    @InjectModel(Run.name)
    private readonly runModel: Model<RunDocument>,
  ) { }

  public async findOneLocally(
    id: mongoose.Types.ObjectId,
  ): Promise<RunDocument> {
    let result = await this.runModel
      .findById(id)
      .populate({
        path: 'training',
      })
      .populate({
        path: 'project',
      })
      .exec();
    if (result == null)
      throw new NotFoundException(`Could not find run with ID ${id}`);
    return result;
  }

  private async findByRunId(runId: string): Promise<RunDocument> {
    let result = await this.runModel
      .findOne()
      .where('runId')
      .equals(runId)
      .populate({
        path: 'training',
      })
      .populate({
        path: 'project',
      })
      .exec();
    if (result == null)
      throw new NotFoundException(`Could not find run for runId ${runId}`);
    return result;
  }

  private async existsByRunId(runId: string): Promise<boolean> {
    return (
      (await this.runModel.findOne().where('runId').equals(runId).exec()) !==
      null
    );
  }

  private async findByLocalRunStatus(
    localRunStatus: RunStatus[],
  ): Promise<RunDocument[]> {
    return await this.runModel
      .find()
      .where('status')
      .in(localRunStatus)
      .populate('training')
      .populate({
        path: 'project',
      })
      .exec();
  }

  private async update(
    id: mongoose.Types.ObjectId,
    updateRunInput: UpdateRunInput,
  ): Promise<RunDocument> {
    await this.runModel.findByIdAndUpdate(id, updateRunInput).exec();
    return this.findOneLocally(id);
  }

  public async findByTrainingId(
    trainingId: mongoose.Types.ObjectId,
  ): Promise<Run> | null {
    const localRun = await this.runModel
      .findOne()
      .where('training')
      .equals(trainingId)
      .populate({
        path: 'training',
      })
      .populate({
        path: 'project',
      })
      .exec();
    if (!localRun) return null;
    const runFromApi = await this.getRun(localRun.runId);

    return classToClassFromExist(runFromApi, localRun);
  }

  public async cancelRun(runId: string): Promise<Run> {
    if (!runId)
      throw new IllegalArgumentException('Parameter runId must be defined');
    try {
      await this.defaultRemoteRunService.cancelRun(runId);
      const run = await this.findByRunId(runId);
      run.status = RunStatus.CANCELLING;
      await this.update(run._id, run);
      return run;
    } catch (e) {
      this.logger.error(e);
      throw new RuntimeException(e);
    }
  }

  @CacheTTL(10)
  @UseInterceptors(CacheInterceptor)
  public async getRun(runId: string): Promise<Run> {
    if (!runId)
      throw new IllegalArgumentException('Parameter runId must be defined');

    const run = await this.findByRunId(runId);
    const runFromApi = await this.defaultRemoteRunService.getRun(runId);
    runFromApi._id = run._id;

    if (
      [RunStatus.RUNNING].includes(runFromApi.status) &&
      [RunStatus.SCHEDULED, RunStatus.CANCELLING].includes(run.status)
    ) {
      runFromApi.status = run.status; // Local run status is more informative than remote
    }
    if (
      ![RunStatus.RUNNING].includes(runFromApi.status) &&
      runFromApi.status !== run.status
    ) {
      run.status = runFromApi.status; // Set local run status to running
      await run.save();
    }

    return runFromApi;
  }

  public async deleteRun(runId: string): Promise<Run> {
    if (!runId)
      throw new IllegalArgumentException('Parameter runId must be defined');
    try {
      try {
        const runFromApi = await this.defaultRemoteRunService.getRun(runId);
        if (runFromApi) {
          if (runFromApi.status === RunStatus.RUNNING)
            await this.defaultRemoteRunService.cancelRun(runId); // if running -> first cancel, then delete
          await this.defaultRemoteRunService.deleteRun(runId); // delete remote
          const run = await this.findByRunId(runFromApi.runId); // delete local
          await run.remove();
        }
        return runFromApi;
      } catch (e) {
        if (e instanceof NotFoundException) {
          this.logger.debug('Run not found. Seems to be deleted.');
          return null;
        }
        this.logger.error(e);
      }
    } catch (e) {
      this.logger.error(e);
      throw new RuntimeException(e);
    }
  }

  public async getMetric(runId: string, metric: string): Promise<Metric> {
    return this.defaultRemoteRunService.getMetric(runId, metric);
  }

  public async getMetrics(runId: string): Promise<Metric[]> {
    return this.defaultRemoteRunService.getMetrics(runId);
  }

  public async getRunParameters(runId: string): Promise<RunParameters> {
    return this.defaultRemoteRunService.getRunParameters(runId);
  }

  @OnEvent('Training.post.remove')
  private async onTrainingPostRemove(
    payload: MongoPostRemoveEvent<TrainingDocument>,
  ) {
    // if a training is deleted non-soft, the corresponding run will be also deleted hardly
    const runForTraining = await this.findByTrainingId(payload.doc.id);
    if (runForTraining) {
      this.logger.debug('Deleting run if exists...');
      await this.deleteRun(runForTraining.runId);
    } else {
      this.logger.debug('No run found.');
    }
  }

  @OnEvent('Project.post.remove')
  async onProjectPostRemove(payload: MongoPostRemoveEvent<ProjectDocument>) {
    // on project delete -> delete runs if there are any remaining (which may had training = null in case of manual db changes)
    const runs = await this.runModel
      .find()
      .where({ project: payload.doc.id })
      .exec();
    for (const run of runs) {
      this.logger.debug(`Deleting run ${run.id} [${run.runId}]`);
      await this.deleteRun(run.runId);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  private async checkRunningRuns() {
    const runningStates = [RunStatus.RUNNING, RunStatus.CANCELLING]; // States which determine a run being running

    const runs: Run[] = await this.findByLocalRunStatus(runningStates); // find local runs which are marked as running
    this.logger.debug(`Found active runs [${runs?.map((x) => x.id)}]`);
    for (const run of runs) {
      const runFromApi = await this.getRun(run.runId); // retrieve latest data for run from api
      if (!runningStates.includes(runFromApi.status)) {
        // latest data says "run is no longer running"
        this.logger.debug(
          `Training ${run.training.id} changed state to ${runFromApi.status}`,
        );
        run.status = runFromApi.status; // update local run status with remote's final status
        await this.update(run.id, run);
      } else if (moment(run.training.latestEndTime).isBefore(moment())) {
        // training time is over -> cancel
        this.logger.debug(
          `Training time exceeded for training ${run.training.id}`,
        );
        await this.cancelRun(run.runId);
      }
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  private async obtainRecentlyStartedRuns() {
    const trainingsInQueue: TrainingDocument[] = await this.trainingService.findEnqueuedTrainings(); // get trainings which have a queue message
    for (let training of trainingsInQueue) {
      try {
        const run = await this.defaultRemoteRunService
          .getTaskQueue()
          .obtainRun(training.queueMessageId); // check if run exists for queue message

        if (run && !(await this.existsByRunId(run.runId))) {
          // run exists for queue message
          this.logger.debug(`Obtained run for training ${training.id}`);

          // create new local run for obtained run
          const newRun = new this.runModel(run);
          newRun.training = training;
          newRun.project = training.project;
          await newRun.save();

          training.queueMessageId = null;
          await training.save();
        } else {
          this.logger.debug(`No run for training ${training.id} yet`);
        }
      } catch (e) {
        if (e instanceof NotFoundException) {
          this.logger.error(
            `Task for training ${training.id} not found. Seems to be run crashed before training started!`,
          );
          training.queueMessageId = null;
          await training.save();
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  private async enqueueTrainingTasks() {
    const startableTrainings: TrainingDocument[] = await this.trainingService.findExecutables(); // get trainings which are "startable" and not been enqueued yet
    for (let training of startableTrainings) {
      const existingRunForTraining = await this.findByTrainingId(training.id);
      if (
        !this.startingTrainings.has(training._id.toHexString()) && // if training not started and no run exists
        !existingRunForTraining
      ) {
        this.startingTrainings.add(training._id.toHexString()); // mark training as started

        this.logger.debug(`Enqueueing training ${training.id}`);

        try {
          const pendingRun: IPendingRun = await this.defaultRemoteRunService
            .getTaskQueue()
            .enqueueTask(await this.createTrainingTask(training));

          training.queueMessageId = pendingRun.messageId; // set queue message id which will be used to obtain the run in future
          await training.save();
        } catch (e) {
          this.logger.error(`Could not start training: ${e}`);
        } finally {
          this.startingTrainings.delete(training._id.toHexString());
        }
      }
    }
  }

  private async createTrainingTask(training: Training): Promise<TrainingTask> {
    const model = this.modelsService.findOne(training.model);
    const profile = model.profiles.filter(
      (x) => x.name === training.profileDescription.profile,
    )[0];
    const runtime = await this.runtimeService.findByName(
      training.runtimeDescription.runtime,
    );

    const trainingTask = new TrainingTask();
    trainingTask.projectId = training.project._id.toHexString();
    trainingTask.trainingId = training._id.toHexString();
    trainingTask.scriptUrl = profile.script.url;
    trainingTask.parameters = await this._createParameters(training, profile);

    trainingTask.runtime = runtime.name;
    const runtimeParameters = new Map<string, Scalar | Array<Scalar>>();
    if (training.runtimeDescription.parameters) {
      for (const [parameterName, parameterValue] of training.runtimeDescription
        ?.parameters) {
        runtimeParameters.set(parameterName, parameterValue);
      }
    }
    trainingTask.runtimeParameters = runtimeParameters;

    return trainingTask;
  }

  private async _createParameters(
    training: Training,
    profile: Profile,
  ): Promise<Map<string, Scalar | Array<Scalar>>> {
    const parameters = new Map<string, Scalar | Array<Scalar>>();
    for (const fixedParameter of profile.script.fixedParameters || []) {
      parameters.set(
        fixedParameter.name,
        RunService.determineParameterValue(
          fixedParameter,
          fixedParameter.default,
        ),
      );
    }
    for (const hyperParameter of profile.script.hyperParameters || []) {
      parameters.set(
        hyperParameter.name,
        RunService.determineParameterValue(
          hyperParameter,
          training.profileDescription.hyperParameters.get(hyperParameter.name),
        ),
      );
    }
    for (const trainingParameter of profile.script.trainingParameters || []) {
      parameters.set(
        trainingParameter.name,
        RunService.determineParameterValue(
          trainingParameter,
          training.profileDescription.trainingParameters.get(
            trainingParameter.name,
          ),
        ),
      );
    }

    const project = await this.projectService.findOne(training.project.id);

    // append tagflip specific parameters
    parameters.set('project_id', training.project._id.toHexString());
    parameters.set('training_id', training._id.toHexString());
    parameters.set('tagflip_host', this.environment.AUTONLP_CORE_PUBLIC_URL);
    parameters.set('dataset_name', project.dataset.datasetName);
    parameters.set('subset_name', project.dataset.subsetName);
    parameters.set('dataset_provider_name', project.dataset.providerName);

    return parameters;
  }

  private static determineParameterValue(
    parameterDefinition: ParameterDefinition,
    parameterValue: Scalar,
  ): any {
    let value =
      parameterValue ||
      parameterDefinition.default ||
      throwError(
        new RuntimeException(
          `No value for parameter ${parameterDefinition.name}`,
        ),
      );

    if (parameterDefinition.type === 'float') {
      if (typeof value === 'string') value = Number.parseFloat(value);
      if (Number.isInteger(value)) value = Number(value).toFixed(1);
    }
    return value;
  }
}
