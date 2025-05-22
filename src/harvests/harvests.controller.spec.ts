import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HarvestsController } from './harvests.controller';
import { HarvestsService } from './harvests.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Harvest } from './entities/harvest.entity';
import { User } from '../users/entities/user.entity';
import { UserValidationService } from '../common/services/user-validation.service';
import { HarvestValidationService } from '../common/services/harvest-validation.service';

// Mock para evitar erros com @User() decorator
jest.mock('../common/decorators/user.decorator', () => ({
  User: jest.fn().mockImplementation(() => () => {}),
}));

describe('HarvestsController', () => {
  let controller: HarvestsController;
  let service: HarvestsService;

  const mockJwtPayload: JwtPayload = {
    sub: 1,
    email: 'test@example.com',
  };

  const mockUser = {
    id: Number(mockJwtPayload.sub),
    name: 'Test User',
    email: mockJwtPayload.email,
  } as User;

  const mockHarvest = {
    id: 1,
    name: 'Safra 2024',
    created_by: mockUser,
  } as Harvest;

  const mockHarvestArray = [
    mockHarvest,
    {
      ...mockHarvest,
      id: 2,
      name: 'Safra 2025',
    },
  ];

  const mockCreateHarvestDto: CreateHarvestDto = {
    name: 'Nova Safra',
  };

  const mockUpdateHarvestDto: UpdateHarvestDto = {
    name: 'Safra 2024 Atualizada',
  };

  const mockUserValidationService = {
    validate: jest.fn(),
    validateEmailUnique: jest.fn(),
  };

  const mockHarvestValidationService = {
    validate: jest.fn(),
    validateNameUnique: jest.fn(),
  };

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
