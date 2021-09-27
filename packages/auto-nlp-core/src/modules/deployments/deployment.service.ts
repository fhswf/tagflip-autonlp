import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { PaginationArgs } from '../../common/graphql/pagination.args';
import { RunService } from '../trainings/execution/run.service';
import { DefaultDeploymentExecutionService } from './default-deployment-execution.service';
import { CreateDeploymentInput } from './dto/create-deployment.input';
import { UpdateDeploymentInput } from './dto/update-deployment.input';
import { DeploymentTask } from './entities/deployment-task.entity';
import { Deployment, DeploymentDocument } from './entities/deployment.entitiy';

@Injectable()
export class DeploymentService {
  private logger: Logger = new Logger(DeploymentService.name);

  constructor(
    @InjectModel(Deployment.name)
    private readonly deploymentModel: Model<DeploymentDocument>,
    @Inject(forwardRef(() => DefaultDeploymentExecutionService))
    private readonly deploymentExecutionService: DefaultDeploymentExecutionService,
    private readonly runService: RunService,
  ) {}

  async create(
    createDeploymentInput: CreateDeploymentInput,
  ): Promise<DeploymentDocument> {
    const newDeployment = new this.deploymentModel(createDeploymentInput);

    const run = await this.runService.findOneLocally(createDeploymentInput.run);

    try {
      const deploymentTask = new DeploymentTask();
      deploymentTask.runId = run.runId;
      deploymentTask.runtime = createDeploymentInput.runtimeDescription.runtime;
      deploymentTask.parameters =
        createDeploymentInput.runtimeDescription.parameters;
      newDeployment.deploymentId = (
        await this.deploymentExecutionService.createDeployment(deploymentTask)
      ).deploymentId;
      newDeployment.project = run.training.project; // saving project for training to reduce reads
      return newDeployment.save();
    } catch (e) {
      this.logger.error('Could not save deployment');
      throw e;
    }
  }

  async findAllByProjectId(
    projectId: mongoose.Types.ObjectId,
    paginationArgs?: PaginationArgs,
  ): Promise<DeploymentDocument[]> {
    let query = this.deploymentModel
      .find()
      .populate('run')
      .populate({
        path: 'run',
        populate: {
          path: 'training',
        },
      })
      .populate('project')
      .where('project')
      .equals(projectId);

    if (paginationArgs) {
      query = query.skip(paginationArgs.offset).limit(paginationArgs.limit);
    }
    return query.exec();
  }

  async findAll(): Promise<DeploymentDocument[]> {
    let query = this.deploymentModel.find();
    return query.exec();
  }

  async count(projectId: mongoose.Types.ObjectId): Promise<number> {
    let query = this.deploymentModel
      .countDocuments()
      .populate('project')
      .where('project')
      .equals(projectId);
    return query.exec();
  }

  async findOne(id: mongoose.Types.ObjectId): Promise<DeploymentDocument> {
    let result = await this.deploymentModel
      .findById(id)
      .populate('run')
      .populate({
        path: 'run',
        populate: {
          path: 'training',
        },
      })
      .populate('project')
      .exec();
    if (result == null)
      throw new NotFoundException(`Could not find deployment with ID ${id}`);
    return result;
  }

  async findByExternalDeploymentId(
    externalDeploymentId: string,
  ): Promise<DeploymentDocument> {
    let result = await this.deploymentModel
      .findOne()
      .populate('run')
      .populate({
        path: 'run',
        populate: {
          path: 'training',
        },
      })
      .populate('project')
      .where('deploymentId')
      .equals(externalDeploymentId)
      .exec();
    if (result == null)
      throw new NotFoundException(
        `Could not find deployment with externalDeploymentId ${externalDeploymentId}`,
      );
    return result;
  }

  async update(
    id: mongoose.Types.ObjectId,
    updateDeploymentInput: UpdateDeploymentInput,
  ): Promise<DeploymentDocument> {
    await this.deploymentModel
      .findByIdAndUpdate(id, updateDeploymentInput)
      .exec();
    return this.findOne(id);
  }

  async remove(id: mongoose.Types.ObjectId) {
    const deployment = await this.deploymentModel.findById(id).exec();

    try {
      // try to delete remote deployment
      await this.deploymentExecutionService.removeDeployment(
        deployment.deploymentId,
      );
      // no exception -> delete locally
      await deployment.remove();
      return deployment;
    } catch (e) {
      if (e instanceof NotFoundException) {
        // deployment doesn't exist -> delete locally
        await deployment.remove();
        return deployment;
      }
      // any other exception -> keep local deployment info
      this.logger.error(
        `Could not undeploy deployment with ID ${id} [${deployment.deploymentId}]: ${e}`,
      );
      throw e;
    }
  }
}
