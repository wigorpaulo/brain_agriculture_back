import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlantedCulturesService } from './planted_cultures.service';
import { CreatePlantedCultureDto } from './dto/create-planted_culture.dto';
import { UpdatePlantedCultureDto } from './dto/update-planted_culture.dto';
import { PlantedCulture } from './entities/planted_culture.entity';
import { User } from '../users/entities/user.entity';
import { UserValidationService } from '../common/services/user-validation.service';
import { PlantedCultureValidationService } from '../common/services/planted_culture-validation.service';

describe('PlantedCulturesService', () => {
  let service: PlantedCulturesService;
  let plantedCultureRepo: Repository<PlantedCulture>;
  let userValidationService: UserValidationService;
  let plantedCultureValidationService: PlantedCultureValidationService;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
  } as User;

  const mockPlantedCulture = {
    id: 1,
    name: 'Soja',
    created_by: mockUser,
  } as PlantedCulture;

  const mockPlantedCultureArray = [
    mockPlantedCulture,
    {
      ...mockPlantedCulture,
      id: 2,
      name: 'Milho',
    },
  ];

  const mockCreatePlantedCultureDto: CreatePlantedCultureDto = {
    name: 'Trigo',
  };

  const mockUpdatePlantedCultureDto: UpdatePlantedCultureDto = {
    name: 'Trigo Atualizado',
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PlantedCulturesService,
        {
          provide: getRepositoryToken(PlantedCulture),
          useClass: Repository,
        },
        {
          provide: UserValidationService,
          useValue: {
            validate: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: PlantedCultureValidationService,
          useValue: {
            validateNameUnique: jest.fn(),
            validate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<PlantedCulturesService>(PlantedCulturesService);
    plantedCultureRepo = moduleRef.get<Repository<PlantedCulture>>(
      getRepositoryToken(PlantedCulture),
    );
    userValidationService = moduleRef.get<UserValidationService>(
      UserValidationService,
    );
    plantedCultureValidationService =
      moduleRef.get<PlantedCultureValidationService>(
        PlantedCultureValidationService,
      );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new planted culture', async () => {
      jest
        .spyOn(plantedCultureValidationService, 'validateNameUnique')
        .mockResolvedValue();
      jest.spyOn(userValidationService, 'validate').mockResolvedValue(mockUser);
      jest
        .spyOn(plantedCultureRepo, 'create')
        .mockReturnValue(mockPlantedCulture);
      jest
        .spyOn(plantedCultureRepo, 'save')
        .mockResolvedValue(mockPlantedCulture);

      const result = await service.create(
        mockCreatePlantedCultureDto,
        mockUser.id,
      );

      expect(result).toEqual(JSON.parse(JSON.stringify(mockPlantedCulture)));
      expect(
        plantedCultureValidationService.validateNameUnique,
      ).toHaveBeenCalledWith(mockCreatePlantedCultureDto.name);
      expect(userValidationService.validate).toHaveBeenCalledWith(mockUser.id);
      expect(plantedCultureRepo.create).toHaveBeenCalled();
      expect(plantedCultureRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of planted cultures serialized', async () => {
      jest
        .spyOn(plantedCultureRepo, 'find')
        .mockResolvedValue(mockPlantedCultureArray);

      const result = await service.findAll();

      expect(result).toEqual(
        JSON.parse(JSON.stringify(mockPlantedCultureArray)),
      );
      expect(plantedCultureRepo.find).toHaveBeenCalledWith({
        relations: ['created_by'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single planted culture by ID', async () => {
      jest
        .spyOn(plantedCultureRepo, 'findOne')
        .mockResolvedValue(mockPlantedCulture);

      const result = await service.findOne(1);

      expect(result).toEqual(mockPlantedCulture);
      expect(plantedCultureRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('update', () => {
    it('should update the planted culture name', async () => {
      jest
        .spyOn(plantedCultureValidationService, 'validateNameUnique')
        .mockResolvedValue();
      jest
        .spyOn(plantedCultureValidationService, 'validate')
        .mockResolvedValue(mockPlantedCulture);
      jest
        .spyOn(plantedCultureRepo, 'merge')
        .mockReturnValue({ ...mockPlantedCulture, name: 'Trigo Atualizado' });
      jest.spyOn(plantedCultureRepo, 'save').mockResolvedValue({
        ...mockPlantedCulture,
        name: mockUpdatePlantedCultureDto.name ?? 'Trigo Atualizado',
      });

      const result = await service.update(1, mockUpdatePlantedCultureDto);

      expect(result.name).toBe(mockUpdatePlantedCultureDto.name);
      expect(
        plantedCultureValidationService.validateNameUnique,
      ).toHaveBeenCalledWith(mockUpdatePlantedCultureDto.name);
      expect(plantedCultureValidationService.validate).toHaveBeenCalledWith(1);
      expect(plantedCultureRepo.merge).toHaveBeenCalled();
      expect(plantedCultureRepo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a planted culture by ID', async () => {
      jest
        .spyOn(plantedCultureValidationService, 'validate')
        .mockResolvedValue(mockPlantedCulture);
      jest.spyOn(plantedCultureRepo, 'remove').mockResolvedValue(mockPlantedCulture);

      await service.remove(1);

      expect(plantedCultureValidationService.validate).toHaveBeenCalledWith(1);
      expect(plantedCultureRepo.remove).toHaveBeenCalledWith(
        mockPlantedCulture,
      );
    });
  });
});
