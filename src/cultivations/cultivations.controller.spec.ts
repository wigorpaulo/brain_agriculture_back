import { Test, TestingModule } from '@nestjs/testing';
import { CultivationsController } from './cultivations.controller';
import { CultivationsService } from './cultivations.service';
import { CreateCultivationDto } from './dto/create-cultivation.dto';
import { UpdateCultivationDto } from './dto/update-cultivation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { Producer } from '../producers/entities/producer.entity';
import { State } from '../states/entities/state.entity';
import { City } from '../cities/entities/city.entity';
import { RuralProperty } from '../rural_properties/entities/rural_property.entity';
import { Cultivation } from './entities/cultivation.entity';
import { Harvest } from '../harvests/entities/harvest.entity';
import { PlantedCulture } from '../planted_cultures/entities/planted_culture.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserValidationService } from '../common/services/user-validation.service';
import { mockJwtPayload } from '../../test/mocks/jwt.mocks';
import {
  mockCultivation,
  mockCultivationArray,
  mockCreateCultivationDto,
} from '../../test/mocks/cultivation.mocks';
import {
  mockUser,
  mockUserValidationService,
} from '../../test/mocks/user.mock';

// Mock para evitar erro com @User() decorator
jest.mock('../common/decorators/user.decorator', () => ({
  User: jest.fn().mockImplementation(() => () => {}),
}));

describe('CultivationsController', () => {
  let controller: CultivationsController;
  let service: CultivationsService;

  const mockHarvestNew = {
    id: 1,
    name: 'Safra 2024 atualizado',
    created_by: mockUser,
  } as Harvest;

  const mockUpdateCultivationDto: UpdateCultivationDto = {
    harvestId: mockHarvestNew.id,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CultivationsController],
      providers: [
        {
          provide: CultivationsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Cultivation),
          useValue: {},
        },
        {
          provide: UserValidationService,
          useValue: mockUserValidationService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // desativa a guarda JWT nos testes
      .compile();

    controller = module.get<CultivationsController>(CultivationsController);
    service = module.get<CultivationsService>(CultivationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a cultivation with user ID from @User()', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockCultivation);

      const result = await controller.create(
        mockCreateCultivationDto,
        mockJwtPayload,
      );

      expect(result).toEqual(mockCultivation);
      expect(service.create).toHaveBeenCalledWith(
        mockCreateCultivationDto,
        mockJwtPayload.sub,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of cultivations', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(mockCultivationArray);

      const result = await controller.findAll();

      expect(result).toBe(mockCultivationArray);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single cultivation by ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCultivation);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockCultivation);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a cultivation by ID', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockCultivation);

      const result = await controller.update('1', mockUpdateCultivationDto);

      expect(result).toEqual(mockCultivation);
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateCultivationDto);
    });
  });

  describe('remove', () => {
    it('should delete a cultivation by ID', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
