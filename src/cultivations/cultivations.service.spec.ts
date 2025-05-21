import { Test, TestingModule } from '@nestjs/testing';
import { CultivationsService } from './cultivations.service';

describe('CultivationsService', () => {
  let service: CultivationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CultivationsService],
    }).compile();

    service = module.get<CultivationsService>(CultivationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
