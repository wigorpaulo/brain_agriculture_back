import { Test, TestingModule } from '@nestjs/testing';
import { PlantedCulturesController } from './planted_cultures.controller';
import { PlantedCulturesService } from './planted_cultures.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlantedCulture } from './entities/planted_culture.entity';
import { PlantedCultureValidationService } from '../common/services/planted_culture-validation.service';
import { UserValidationService } from '../common/services/user-validation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockUserValidationService } from '../../test/mocks/user.mock';
import { mockJwtPayload } from '../../test/mocks/jwt.mocks';
import {
  mockPlantedCulture,
  mockPlantedCultureArray,
  mockCreatePlantedCultureDto,
  mockUpdatePlantedCultureDto,
  mockPlantedCultureValidationService,
} from '../../test/mocks/planted_culture.mocks';

// Mock para evitar erros com @User() decorator
jest.mock('../common/decorators/user.decorator', () => ({
  User: jest.fn().mockImplementation(() => () => {}),
}));

describe('PlantedCulturesController', () => {
  let controller: PlantedCulturesController;
  let service: PlantedCulturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlantedCulturesController],
      providers: [
        PlantedCulturesService,
        {
          provide: getRepositoryToken(PlantedCulture),
          useValue: {},
        },
        {
          provide: UserValidationService,
          useValue: mockUserValidationService,
        },
        {
          provide: PlantedCultureValidationService,
          useValue: mockPlantedCultureValidationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // desativa a guarda JWT nos testes
      .compile();

    controller = module.get<PlantedCulturesController>(
      PlantedCulturesController,
    );
    service = module.get<PlantedCulturesService>(PlantedCulturesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a planted culture with user ID from @User()', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockPlantedCulture as PlantedCulture);

      const result = await controller.create(
        mockCreatePlantedCultureDto,
        mockJwtPayload,
      );

      expect(result).toEqual(mockPlantedCulture);
      expect(service.create).toHaveBeenCalledWith(
        mockCreatePlantedCultureDto,
        mockJwtPayload.sub,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of planted cultures', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(mockPlantedCultureArray);

      const result = await controller.findAll();

      expect(result).toBe(mockPlantedCultureArray);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single planted culture by ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockPlantedCulture);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockPlantedCulture);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a planted culture by ID', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockPlantedCulture);

      const result = await controller.update('1', mockUpdatePlantedCultureDto);

      expect(result).toEqual(mockPlantedCulture);
      expect(service.update).toHaveBeenCalledWith(
        1,
        mockUpdatePlantedCultureDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a planted culture by ID', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
