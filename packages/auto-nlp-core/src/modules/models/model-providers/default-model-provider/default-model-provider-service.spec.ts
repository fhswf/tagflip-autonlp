import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import 'reflect-metadata';
import { DefaultModelProviderService } from './default-model-provider.service';

describe('DefaultModelProviderService', () => {
  let service: DefaultModelProviderService;
  let module: TestingModule;

  beforeEach(async () => {
    process.env.MODEL_FILE = "config/models.yaml"
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [DefaultModelProviderService],
    }).compile();

    service = module.get<DefaultModelProviderService>(
      DefaultModelProviderService,
    );
  });

  it('init', () => {
    expect(service).toBeDefined();
  });

  it('findAll', () => {
    const models = service.findAll();
    expect(models).toBeDefined();
  });
});
