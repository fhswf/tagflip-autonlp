import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { PaginationArgs } from '../../common/graphql/pagination.args';
import { MongoPostRemoveEvent } from '../../common/mongo-events/mongo-events.module';
import { ProjectDocument } from '../projects/entities/project.entity';
import { CreateTrainingInput } from './dto/create-training.input';
import { UpdateTrainingInput } from './dto/update-training.input';
import { Training, TrainingDocument } from './entities/training.entity';
import { RunService } from './execution/run.service';

@Injectable()
export class TrainingService {
  constructor(
    @InjectModel(Training.name)
    private readonly trainingModel: Model<TrainingDocument>,
    @Inject(forwardRef(() => RunService))
    private readonly runService: RunService,
  ) { }

  async create(
    createTrainingInput: CreateTrainingInput,
  ): Promise<TrainingDocument> {
    return new this.trainingModel(createTrainingInput).save();
  }

  async findAll(
    projectId: mongoose.Types.ObjectId,
    paginationArgs?: PaginationArgs,
  ): Promise<TrainingDocument[]> {
    let query = this.trainingModel
      .find({ deleted: false })
      .where('project')
      .equals(projectId)
      .populate('project')
      .sort({ earliestStartTime: -1 });
    if (paginationArgs) {
      query = query.skip(paginationArgs.offset).limit(paginationArgs.limit);
    }
    return query.exec();
  }

  async count(projectId: mongoose.Types.ObjectId): Promise<number> {
    const query = this.trainingModel
      .countDocuments({ deleted: false })
      .where('project')
      .equals(projectId);
    return query.exec();
  }

  async findOne(id: mongoose.Types.ObjectId): Promise<Training> {
    const result = await this.trainingModel
      .findById(id)
      .populate({
        path: 'project',
      })
      .exec();
    if (result == null)
      throw new NotFoundException(`Could not find training with ID ${id}`);
    return result;
  }

  async findExecutables(): Promise<TrainingDocument[]> {
    return this.trainingModel
      .find({
        deleted: false,
        $or: [{ queueMessageId: null }, { queueMessageId: { $exists: false } }],
      })
      .where('earliestStartTime')
      .lte(Date.now())
      .where('latestEndTime')
      .gt(Date.now())
      .populate('project')
      .exec();
  }

  async findEnqueuedTrainings(): Promise<TrainingDocument[]> {
    return this.trainingModel
      .find({ deleted: false })
      .where('earliestStartTime')
      .lte(Date.now())
      .where('latestEndTime')
      .gt(Date.now())
      .where('queueMessageId')
      .exists(true)
      .populate('project')
      .exec();
  }

  async update(
    id: mongoose.Types.ObjectId,
    updateTrainingInput: UpdateTrainingInput,
  ): Promise<Training> {
    await this.trainingModel.findByIdAndUpdate(id, updateTrainingInput).exec();
    return this.findOne(id);
  }

  async remove(id: mongoose.Types.ObjectId) {
    // delete training hard (this should only be the case if project is deleted)
    const training = await this.trainingModel.findById(id).exec();
    await training.remove();
    return training;
  }

  async removeSoft(id: mongoose.Types.ObjectId): Promise<Training> {
    // mark training as deleted but keep training (and run) in db
    const training = await this.trainingModel.findById(id).exec();
    training.deleted = true;
    return training.save();
  }

  @OnEvent('Project.post.remove')
  async onProjectPostRemove(payload: MongoPostRemoveEvent<ProjectDocument>) {
    // on project delete -> delete trainings hard
    const trainings = await this.trainingModel
      .find()
      .where({ project: payload.doc.id })
      .exec();
    for (const training of trainings) {
      await training.remove();
    }
  }
}
