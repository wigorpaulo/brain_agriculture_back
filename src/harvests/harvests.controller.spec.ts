import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HarvestsController } from './harvests.controller';
import { HarvestsService } from './harvests.service';
import { Harvest } from './entities/harvest.entity';
import { UserValidationService } from '../common/services/user-validation.service';
import { HarvestValidationService } from '../common/services/harvest-validation.service';
import { mockJwtPayload } from '../../test/mocks/jwt.mocks';
import { mockUserValidationService } from '../../test/mocks/user.mock';
import {
  mockHarvest,
  mockHarvestArray,
  mockCreateHarvestDto,
  mockUpdateHarvestDto,
  mockHarvestValidationService,
} from '../../test/mocks/harvest.mocks';

// Mock para evitar erros com @User() decorator
jest.mock('../common/decorators/user.decorator', () => ({
  User: jest.fn().mockImplementation(() => () => {}),
}));

describe('HarvestsController', () => {
  let controller: HarvestsController;
  let service: HarvestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HarvestsController],
      providers: [
        HarvestsService,
        {
          provide: getRepositoryToken(Harvest),
          useClass: Repository,
        },
        {
          provide: UserValidationService,
          useValue: mockUserValidationService,
        },
        {
          provide: HarvestValidationService,
          useValue: mockHarvestValidationService,
        },
      ],
    }).compile();

    controller = module.get<HarvestsController>(HarvestsController);
    service = module.get<HarvestsService>(HarvestsService);

    // Limpa os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a harvest with user ID from @User()', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockHarvest as Harvest);

      const result = await controller.create(
        mockCreateHarvestDto,
        mockJwtPayload,
      );

      expect(result).toEqual(mockHarvest);
      expect(service.create).toHaveBeenCalledWith(
        mockCreateHarvestDto,
        mockJwtPayload.sub,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of harvests', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(mockHarvestArray);

      const result = await controller.findAll();

      expect(result).toBe(mockHarvestArray);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single harvest by ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockHarvest);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockHarvest);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a harvest by ID', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockHarvest);

      const result = await controller.update('1', mockUpdateHarvestDto);

      expect(result).toEqual(mockHarvest);
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateHarvestDto);
    });
  });

  describe('remove', () => {
    it('should delete a harvest by ID', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
