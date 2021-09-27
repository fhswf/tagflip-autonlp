import { Model } from './entities/model.entity';

export interface ModelProvider {
  findAll(): Model[];

  findOne(name: string): Model;
}
