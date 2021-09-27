import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { TaskType } from 'auto-nlp-shared-js';
import { DatasetProvidersService } from './dataset-providers/dataset-providers.service';
import { DatasetsService } from './datasets.service';
import { Dataset } from './entities/dataset.entity';

@Controller('datasets')
export class DatasetsController {
  constructor(
    private readonly datasetsService: DatasetsService,
    private readonly datasetProviderService: DatasetProvidersService,
  ) {}

  @Get('providers')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The list of available dataset provider names.',
    type: String,
    isArray: true,
  })
  listDatasetProviders(): string[] {
    return this.datasetProviderService.getDatasetProviderNames();
  }

  @Get(':datasetProvider/datasets')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The list of available datasets for a given provider.',
    type: Dataset,
    isArray: true,
  })
  @ApiParam({
    name: 'datasetProvider',
    required: true,
  })
  @ApiQuery({
    name: 'task',
    required: true,
    enum: TaskType,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  listDatasetsByTask(
    @Param('datasetProvider') datasetProvider: string,
    @Query('task') task: TaskType,
  ): Promise<Dataset[]> {
    return this.datasetsService.listDatasetsByTask(datasetProvider, task);
  }

  @Get(':datasetProvider/dataset')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The dataset.',
    type: Dataset,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'If no dataset can  be found for given name.',
  })
  @ApiParam({
    name: 'datasetProvider',
    required: true,
  })
  @ApiQuery({
    name: 'task',
    required: true,
    enum: TaskType,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  async findDataSet(
    @Param('datasetProvider') datasetProvider: string,
    @Query('datasetName') datasetName: string,
  ): Promise<Dataset> {
    return await this.datasetsService.getDataset(datasetProvider, datasetName);
  }
}
