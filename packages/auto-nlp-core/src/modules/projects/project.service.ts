import {
  HttpService,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MongoPostRemoveEvent } from '../../common/mongo-events/mongo-events.module';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { Project, ProjectDocument } from './entities/project.entity';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  private deploymentServiceUrl: string;

  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.deploymentServiceUrl = this.configService.get(
      'AUTONLP_DEPLOYMENT_URL',
    );
  }

  async create(
    createProjectInput: CreateProjectInput,
  ): Promise<ProjectDocument> {
    const createdProject = new this.projectModel(createProjectInput);
    return createdProject.save();
  }

  async findAll(): Promise<ProjectDocument[]> {
    return this.projectModel.find().exec();
  }

  async findOne(id: mongoose.Types.ObjectId): Promise<ProjectDocument> {
    let result = await this.projectModel.findById(id).exec();
    if (result == null)
      throw new NotFoundException(`Could not find project with ID ${id}`);
    return result;
  }

  async update(
    id: mongoose.Types.ObjectId,
    updateProjectInput: UpdateProjectInput,
  ): Promise<ProjectDocument> {
    await this.projectModel.findByIdAndUpdate(id, updateProjectInput).exec();
    return this.findOne(id);
  }

  async remove(id: mongoose.Types.ObjectId) {
    const project = await this.findOne(id);
    await project.remove();
    return project;
  }

  @OnEvent('Project.post.remove')
  async onProjectPostRemove(payload: MongoPostRemoveEvent<ProjectDocument>) {
    if (payload.doc) {
      try {
        await this.httpService
          .delete(`${this.deploymentServiceUrl}/project/${payload.doc.id}`)
          .toPromise();
      } catch (e) {
        this.logger.error('Could not delete external project data.');
      }
    }
  }
}
