import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HarvestsService } from './harvests.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { Harvest } from './entities/harvest.entity';
import { UserValidationService } from '../common/services/user-validation.service';
import { HarvestValidationService } from '../common/services/harvest-validation.service';
import { User } from '../users/entities/user.entity';

describe('HarvestsService', () => {
  let service: HarvestsService;
  let harvestRepo: Repository<Harvest>;
  let userValidationService: UserValidationService;
  let harvestValidationService: HarvestValidationService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
  } as User;

  const mockHarvest = {
    id: 1,
    name: 'Safra 2024',
    created_by: mockUser,
  } as Harvest;

  const mockHarvestArray = [
    { ...mockHarvest, id: 1 },
    { ...mockHarvest, id: 2, name: 'Safra 2025' },
  ];

  const mockCreateHarvestDto: CreateHarvestDto = {
    name: 'Nova Safra',
  };

  const mockUpdateHarvestDto: UpdateHarvestDto = {
    name: 'Safra 2024 Atualizada',
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        HarvestsService,
        {
          provide: getRepositoryToken(Harvest),
          useClass: Repository,
        },
        {
          provide: UserValidationService,
          useValue: {
            validate: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: HarvestValidationService,
          useValue: {
            validateNameUnique: jest.fn(),
            validate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<HarvestsService>(HarvestsService);
    harvestRepo = moduleRef.get<Repository<Harvest>>(
      getRepositoryToken(Harvest),
    );
    userValidationService = moduleRef.get<UserValidationService>(
      UserValidationService,
    );
    harvestValidationService = moduleRef.get<HarvestValidationService>(
      HarvestValidationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new harvest', async () => {
      jest
        .spyOn(harvestValidationService, 'validateNameUnique')
        .mockResolvedValue();
      jest.spyOn(userValidationService, 'validate').mockResolvedValue(mockUser);
      jest.spyOn(harvestRepo, 'create').mockReturnValue(mockHarvest);
      jest.spyOn(harvestRepo, 'save').mockResolvedValue(mockHarvest);

      const result = await service.create(mockCreateHarvestDto, mockUser.id);

      expect(result).toEqual(expect.objectContaining(mockHarvest));

      expect(harvestValidationService.validateNameUnique).toHaveBeenCalledWith(
        mockCreateHarvestDto.name,
      );
      expect(userValidationService.validate).toHaveBeenCalledWith(mockUser.id);
      expect(harvestRepo.create).toHaveBeenCalled();
      expect(harvestRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of harvests serialized', async () => {
      jest.spyOn(harvestRepo, 'find').mockResolvedValue(mockHarvestArray);

      const result = await service.findAll();

      expect(result).toEqual(
        mockHarvestArray.map((h) => ({
          id: h.id,
          name: h.name,
          created_by: {
            id: mockUser.id,
            email: mockUser.email,
          },
          created_at: h.created_at,
          updated_at: h.updated_at,
        })),
      );

      expect(harvestRepo.find).toHaveBeenCalledWith({
        relations: ['created_by'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single harvest by ID', async () => {
      jest.spyOn(harvestRepo, 'findOne').mockResolvedValue(mockHarvest);

      const result = await service.findOne(1);

      expect(result).toEqual(mockHarvest);
      expect(harvestRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('update', () => {
    it('should update the harvest name', async () => {
      jest
        .spyOn(harvestValidationService, 'validateNameUnique')
        .mockResolvedValue();
      jest
        .spyOn(harvestValidationService, 'validate')
        .mockResolvedValue(mockHarvest);
      jest
        .spyOn(harvestRepo, 'merge')
        .mockReturnValue({ ...mockHarvest, name: 'Safra 2024 Atualizada' });
      jest.spyOn(harvestRepo, 'save').mockResolvedValue({
        ...mockHarvest,
        name: mockUpdateHarvestDto.name ?? 'Safra 2024 Atualizada',
      });

      const result = await service.update(1, mockUpdateHarvestDto);

      expect(result.name).toBe(mockUpdateHarvestDto.name);
      expect(harvestValidationService.validateNameUnique).toHaveBeenCalledWith(
        mockUpdateHarvestDto.name,
      );
      expect(harvestValidationService.validate).toHaveBeenCalledWith(1);
      expect(harvestRepo.merge).toHaveBeenCalled();
      expect(harvestRepo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a harvest by ID', async () => {
      jest
        .spyOn(harvestValidationService, 'validate')
        .mockResolvedValue(mockHarvest);
      jest.spyOn(harvestRepo, 'remove').mockResolvedValue(mockHarvest);

      await service.remove(1);

      expect(harvestValidationService.validate).toHaveBeenCalledWith(1);
      expect(harvestRepo.remove).toHaveBeenCalledWith(mockHarvest);
    });
  });
});
