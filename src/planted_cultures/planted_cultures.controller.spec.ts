import { Test, TestingModule } from '@nestjs/testing';
import { PlantedCulturesController } from './planted_cultures.controller';
import { PlantedCulturesService } from './planted_cultures.service';

describe('PlantedCulturesController', () => {
  let controller: PlantedCulturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlantedCulturesController],
      providers: [PlantedCulturesService],
    }).compile();

    controller = module.get<PlantedCulturesController>(PlantedCulturesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
