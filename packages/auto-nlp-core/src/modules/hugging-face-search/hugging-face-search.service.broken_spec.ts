/** This test suite does not work in a CI environment without mocking the HH search service */


import { HttpModule, HttpService } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HuggingFaceSearchService } from './hugging-face-search.service';
import { TaskType } from 'auto-nlp-shared-js';

describe('HuggingFaceSearchService', () => {
  let service: HuggingFaceSearchService;

  beforeEach(async () => {
    process.env.AUTONLP_HF_SEARCH_SERVICE_URL = 'http://172.25.0.6:3001'
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), HttpModule],
      providers: [HuggingFaceSearchService],
    }).compile();
    const axios = (await moduleRef.resolve(HttpService)).axiosRef;
    axios.interceptors.request.use((config) => {
      console.log(axios.getUri(config));
      return config;
    });

    service = moduleRef.get<HuggingFaceSearchService>(HuggingFaceSearchService);
  });

  it('listDatasets', async () => {
    let datasets = await service.listDatasetsByTask(TaskType.Token_Classification)
    console.log(datasets);
    expect(datasets).toBeDefined();
  });

  it('getDataset', async () => {
    let datasets = await service.getDataset('wikiann');
    console.log(datasets);
    expect(datasets).toBeDefined();
  });
});
