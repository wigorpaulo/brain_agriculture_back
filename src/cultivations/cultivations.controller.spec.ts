import { Test, TestingModule } from '@nestjs/testing';
import { CultivationsController } from './cultivations.controller';
import { CultivationsService } from './cultivations.service';

describe('CultivationsController', () => {
  let controller: CultivationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CultivationsController],
      providers: [CultivationsService],
    }).compile();

    controller = module.get<CultivationsController>(CultivationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
