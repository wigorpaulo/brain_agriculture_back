import { Test, TestingModule } from '@nestjs/testing';
import { RuralPropertiesService } from './rural_properties.service';

describe('RuralPropertiesService', () => {
  let service: RuralPropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuralPropertiesService],
    }).compile();

    service = module.get<RuralPropertiesService>(RuralPropertiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
