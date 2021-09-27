import { HttpModule, HttpService } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HuggingFaceSearchService } from './hugging-face-search.service';

describe('HuggingFaceSearchService', () => {
  let service: HuggingFaceSearchService;

  beforeEach(async () => {
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
    let datasets = await service.listDatasets();
    console.log(datasets);
    expect(datasets).toBeDefined();
  });

  it('getDataset', async () => {
    let datasets = await service.getDataset('wikiann');
    console.log(datasets);
    expect(datasets).toBeDefined();
  });
});
