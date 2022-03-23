import { HttpModule, HttpService } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TagFlipDatasetProviderConfig } from './tagflip-dataset-provider.config';
import { TagFlipDatasetProvider } from './tagflip-dataset.provider';
import { plainToClass } from 'class-transformer';

describe('TagFlipDatasetProvider', () => {
  let provider: TagFlipDatasetProvider;

  const tagflipApi = 'https://jupiter.fh-swf.de/tagflip/api/v1';

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [TagFlipDatasetProvider],
    }).compile();
    const axios = (await moduleRef.resolve(HttpService)).axiosRef;
    axios.interceptors.request.use((config) => {
      console.log(axios.getUri(config));
      return config;
    });
    provider = await moduleRef.resolve<TagFlipDatasetProvider>(
      TagFlipDatasetProvider,
    );
    provider.configure(
      'test',
      plainToClass(TagFlipDatasetProviderConfig, {
        api: tagflipApi + '/',
      }),
    );
  });

  describe('getConfig().api', () => {
    it('should return api url not ending with slash.', async () => {
      expect(provider.getConfig().api).toBe(tagflipApi);
    });
  });

  describe('listDatasets()', () => {
    it('should return api url not ending with slash.', async () => {
      console.log(await provider.listDatasets());
    });
  });

  describe('hasDataset()', () => {
    it('should return api url not ending with slash.', async () => {
      const datasets = await provider.listDatasets();
      datasets.forEach(async (element) => {
        expect(await provider.hasDataset(element.name)).toBe(true);
      });
    });
  });

  describe('getDataset()', () => {
    it('should return api url not ending with slash.', async () => {
      const datasets = await provider.listDatasets();
      const result = await provider.getDataset(datasets[1].name);
      console.log(result);
      expect(result).toBeTruthy();
    });
  });

  describe('gatherRelevantAnnotations()', () => {
    it('should return annotations used in a document of a corpus.', async () => {
      const annotations = await provider.gatherRelevantAnnotations(1, [6, 7]);
      console.log(annotations.map((a) => a.nameAsIOB()));
      expect(annotations).toBeTruthy();
    });
  });
});
