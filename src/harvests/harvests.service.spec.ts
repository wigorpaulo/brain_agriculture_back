import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HarvestsService } from './harvests.service';
import { Harvest } from './entities/harvest.entity';
import { UserValidationService } from '../common/services/user-validation.service';
import { HarvestValidationService } from '../common/services/harvest-validation.service';
import {
  mockUserNew,
  mockUserValidationService,
} from '../../test/mocks/user.mock';
import {
  mockHarvestNew,
  mockHarvestArrayNew,
  mockCreateHarvestDto,
  mockUpdateHarvestDto,
  mockHarvestValidationService,
} from '../../test/mocks/harvest.mocks';

describe('HarvestsService', () => {
  let service: HarvestsService;
  let harvestRepo: Repository<Harvest>;
  let userValidationService: UserValidationService;
  let harvestValidationService: HarvestValidationService;

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
          useValue: mockUserValidationService,
        },
        {
          provide: HarvestValidationService,
          useValue: mockHarvestValidationService,
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
      jest.spyOn(userValidationService, 'validate').mockResolvedValue(mockUserNew);
      jest.spyOn(harvestRepo, 'create').mockReturnValue(mockHarvestNew);
      jest.spyOn(harvestRepo, 'save').mockResolvedValue(mockHarvestNew);

      const result = await service.create(mockCreateHarvestDto, mockUserNew.id);

      expect(result).toEqual(expect.objectContaining(mockHarvestNew));

      expect(harvestValidationService.validateNameUnique).toHaveBeenCalledWith(
        mockCreateHarvestDto.name,
      );
      expect(userValidationService.validate).toHaveBeenCalledWith(mockUserNew.id);
      expect(harvestRepo.create).toHaveBeenCalled();
      expect(harvestRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of harvests serialized', async () => {
      jest.spyOn(harvestRepo, 'find').mockResolvedValue(mockHarvestArrayNew);

      const result = await service.findAll();

      expect(result).toEqual(
        mockHarvestArrayNew.map((h) => ({
          id: h.id,
          name: h.name,
          created_by: {
            id: mockUserNew.id,
            email: mockUserNew.email,
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
      jest.spyOn(harvestRepo, 'findOne').mockResolvedValue(mockHarvestNew);

      const result = await service.findOne(1);

      expect(result).toEqual(mockHarvestNew);
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
        .mockResolvedValue(mockHarvestNew);
      jest
        .spyOn(harvestRepo, 'merge')
        .mockReturnValue({ ...mockHarvestNew, name: 'Safra 2024 Atualizada' });
      jest.spyOn(harvestRepo, 'save').mockResolvedValue({
        ...mockHarvestNew,
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
        .mockResolvedValue(mockHarvestNew);
      jest.spyOn(harvestRepo, 'remove').mockResolvedValue(mockHarvestNew);

      await service.remove(1);

      expect(harvestValidationService.validate).toHaveBeenCalledWith(1);
      expect(harvestRepo.remove).toHaveBeenCalledWith(mockHarvestNew);
    });
  });
});
