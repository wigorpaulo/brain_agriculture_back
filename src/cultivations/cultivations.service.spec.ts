import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CultivationsService } from './cultivations.service';
import { CreateCultivationDto } from './dto/create-cultivation.dto';
import { UpdateCultivationDto } from './dto/update-cultivation.dto';
import { Cultivation } from './entities/cultivation.entity';
import { RuralProperty } from '../rural_properties/entities/rural_property.entity';
import { Harvest } from '../harvests/entities/harvest.entity';
import { PlantedCulture } from '../planted_cultures/entities/planted_culture.entity';
import { User } from '../users/entities/user.entity';
import { UserValidationService } from '../common/services/user-validation.service';
import { CultivationValidationService } from '../common/services/cultivation-validation.service';
import { RuralPropertyValidationService } from '../common/services/rural_property-validation.service';
import { HarvestValidationService } from '../common/services/harvest-validation.service';
import { PlantedCultureValidationService } from '../common/services/planted_culture-validation.service';
import { Producer } from '../producers/entities/producer.entity';
import { State } from '../states/entities/state.entity';
import { City } from '../cities/entities/city.entity';

describe('CultivationsService', () => {
  let service: CultivationsService;
  let cultivationRepo: Repository<Cultivation>;
  let userValidationService: UserValidationService;
  let cultivationValidationService: CultivationValidationService;
  let ruralPropertyValidationService: RuralPropertyValidationService;
  let harvestValidationService: HarvestValidationService;
  let plantedCultureValidationService: PlantedCultureValidationService;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
  } as User;

  const mockProducer = {
    id: 1,
    name: 'João da Silva',
    cpf_cnpj: '80780550056',
    created_by: mockUser,
  } as Producer;

  const mockState: State = {
    id: 1,
    name: 'São Paulo',
    uf: 'SP',
  } as State;

  const mockCity = {
    id: 1,
    name: 'São Paulo',
    state: mockState,
  } as City;

  const mockRuralProperty = {
    id: 1,
    farm_name: 'Fazenda Bela Vista',
    total_area: 8,
    arable_area: 4,
    vegetation_area: 4,
    created_by: mockUser,
    city: mockCity,
    producer: mockProducer,
  } as RuralProperty;

  const mockHarvest = {
    id: 1,
    name: 'Safra 2024',
    created_by: mockUser,
  } as Harvest;

  const mockHarvestNew = {
    id: 1,
    name: 'Safra 2024 atualizado',
    created_by: mockUser,
  } as Harvest;

  const mockPlantedCulture = {
    id: 1,
    name: 'Soja',
    created_by: mockUser,
  } as PlantedCulture;

  const mockCultivation = {
    id: 1,
    rural_property: mockRuralProperty,
    harvest: mockHarvest,
    planted_culture: mockPlantedCulture,
    created_by: mockUser,
  } as Cultivation;

  const mockCultivationArray = [
    mockCultivation,
    {
      ...mockCultivation,
    },
  ];

  const mockCreateCultivationDto: CreateCultivationDto = {
    rural_propertyId: mockRuralProperty.id,
    harvestId: mockHarvest.id,
    planted_cultureId: mockPlantedCulture.id,
  };

  const mockUpdateCultivationDto: UpdateCultivationDto = {
    harvestId: mockHarvestNew.id,
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CultivationsService,
        {
          provide: getRepositoryToken(Cultivation),
          useClass: Repository,
        },
        {
          provide: UserValidationService,
          useValue: {
            validate: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: CultivationValidationService,
          useValue: {
            validate: jest.fn().mockResolvedValue(mockCultivation),
          },
        },
        {
          provide: RuralPropertyValidationService,
          useValue: {
            validate: jest.fn().mockResolvedValue(mockRuralProperty),
          },
        },
        {
          provide: HarvestValidationService,
          useValue: {
            validate: jest.fn().mockResolvedValue(mockHarvest),
          },
        },
        {
          provide: PlantedCultureValidationService,
          useValue: {
            validate: jest.fn().mockResolvedValue(mockPlantedCulture),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<CultivationsService>(CultivationsService);
    cultivationRepo = moduleRef.get<Repository<Cultivation>>(
      getRepositoryToken(Cultivation),
    );
    userValidationService = moduleRef.get<UserValidationService>(
      UserValidationService,
    );
    cultivationValidationService = moduleRef.get<CultivationValidationService>(
      CultivationValidationService,
    );
    ruralPropertyValidationService =
      moduleRef.get<RuralPropertyValidationService>(
        RuralPropertyValidationService,
      );
    harvestValidationService = moduleRef.get<HarvestValidationService>(
      HarvestValidationService,
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
    it('should create and return a new cultivation', async () => {
      jest.spyOn(cultivationRepo, 'create').mockReturnValue(mockCultivation);
      jest.spyOn(cultivationRepo, 'save').mockResolvedValue(mockCultivation);

      const result = await service.create(
        mockCreateCultivationDto,
        mockUser.id,
      );

      expect(result).toEqual(JSON.parse(JSON.stringify(mockCultivation)));
      expect(userValidationService.validate).toHaveBeenCalledWith(mockUser.id);
      expect(ruralPropertyValidationService.validate).toHaveBeenCalledWith(
        mockCreateCultivationDto.rural_propertyId,
      );
      expect(harvestValidationService.validate).toHaveBeenCalledWith(
        mockCreateCultivationDto.harvestId,
      );
      expect(plantedCultureValidationService.validate).toHaveBeenCalledWith(
        mockCreateCultivationDto.planted_cultureId,
      );
      expect(cultivationRepo.create).toHaveBeenCalled();
      expect(cultivationRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of cultivations serialized', async () => {
      jest
        .spyOn(cultivationRepo, 'find')
        .mockResolvedValue(mockCultivationArray);

      const result = await service.findAll();

      expect(result).toEqual(JSON.parse(JSON.stringify(mockCultivationArray)));
      expect(cultivationRepo.find).toHaveBeenCalledWith({
        relations: [
          'rural_property',
          'harvest',
          'planted_culture',
          'created_by',
        ],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single cultivation by ID', async () => {
      jest.spyOn(cultivationRepo, 'findOne').mockResolvedValue(mockCultivation);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCultivation);
      expect(cultivationRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('update', () => {
    it('should update the cultivation name and type', async () => {
      jest
        .spyOn(cultivationValidationService, 'validate')
        .mockResolvedValue(mockCultivation);
      jest.spyOn(cultivationRepo, 'merge').mockReturnValue({
        ...mockCultivation,
        ...mockUpdateCultivationDto,
      });
      jest.spyOn(cultivationRepo, 'save').mockResolvedValue({
        ...mockCultivation,
        ...mockUpdateCultivationDto,
      });

      const result = await service.update(1, mockUpdateCultivationDto);

      expect(result.harvest.id).toBe(mockUpdateCultivationDto.harvestId);
      expect(cultivationValidationService.validate).toHaveBeenCalledWith(1);
      expect(cultivationRepo.merge).toHaveBeenCalled();
      expect(cultivationRepo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a cultivation by ID', async () => {
      jest
        .spyOn(cultivationValidationService, 'validate')
        .mockResolvedValue(mockCultivation);
      jest.spyOn(cultivationRepo, 'remove').mockResolvedValue(mockCultivation);

      await service.remove(1);

      expect(cultivationValidationService.validate).toHaveBeenCalledWith(1);
      expect(cultivationRepo.remove).toHaveBeenCalledWith(mockCultivation);
    });
  });
});
