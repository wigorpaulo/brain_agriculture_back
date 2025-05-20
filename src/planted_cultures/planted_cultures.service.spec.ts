import { Test, TestingModule } from '@nestjs/testing';
import { PlantedCulturesService } from './planted_cultures.service';

describe('PlantedCulturesService', () => {
  let service: PlantedCulturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlantedCulturesService],
    }).compile();

    service = module.get<PlantedCulturesService>(PlantedCulturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
