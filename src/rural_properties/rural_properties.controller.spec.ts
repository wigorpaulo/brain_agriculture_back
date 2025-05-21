import { Test, TestingModule } from '@nestjs/testing';
import { RuralPropertiesController } from './rural_properties.controller';
import { RuralPropertiesService } from './rural_properties.service';

describe('RuralPropertiesController', () => {
  let controller: RuralPropertiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RuralPropertiesController],
      providers: [RuralPropertiesService],
    }).compile();

    controller = module.get<RuralPropertiesController>(RuralPropertiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
