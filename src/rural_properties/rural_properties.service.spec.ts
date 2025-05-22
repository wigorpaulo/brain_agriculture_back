import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RuralPropertiesService } from './rural_properties.service';
import { CreateRuralPropertyDto } from './dto/create-rural_property.dto';
import { UpdateRuralPropertyDto } from './dto/update-rural_property.dto';
import { RuralProperty } from './entities/rural_property.entity';
import { Producer } from '../producers/entities/producer.entity';
import { City } from '../cities/entities/city.entity';
import { User } from '../users/entities/user.entity';
import { UserValidationService } from '../common/services/user-validation.service';
import { ProducerValidationService } from '../common/services/producer-validation.service';
import { RuralPropertyValidationService } from '../common/services/rural_property-validation.service';
import { CityValidationService } from '../common/services/city-validation.service';
import { State } from '../states/entities/state.entity';

describe('RuralPropertiesService', () => {
  let service: RuralPropertiesService;
  let ruralPropertyRepo: Repository<RuralProperty>;
  let userValidationService: UserValidationService;
  let producerValidationService: ProducerValidationService;
  let ruralPropertyValidationService: RuralPropertyValidationService;
  let cityValidationService: CityValidationService;

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

  const mockRuralPropertyArray = [
    mockRuralProperty,
    {
      ...mockRuralProperty,
      id: 2,
      name: 'Chácara Verde',
    },
  ];

  const mockCreateRuralPropertyDto: CreateRuralPropertyDto = {
    farm_name: 'Sítio das Árvores',
    total_area: 30,
    arable_area: 15,
    vegetation_area: 15,
    cityId: mockCity.id,
    producerId: mockProducer.id,
  };

  const mockUpdateRuralPropertyDto: UpdateRuralPropertyDto = {
    farm_name: 'Sítio das Árvores Atualizado',
    arable_area: 18,
    vegetation_area: 7,
    total_area: 25,
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RuralPropertiesService,
        {
          provide: getRepositoryToken(RuralProperty),
          useClass: Repository,
        },
        {
          provide: UserValidationService,
          useValue: {
            validate: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: ProducerValidationService,
          useValue: {
            validate: jest.fn().mockResolvedValue(mockProducer),
          },
        },
        {
          provide: RuralPropertyValidationService,
          useValue: {
            validate: jest.fn().mockResolvedValue(mockRuralProperty),
            validateAreaTotalCanNotBeGreater: jest.fn(),
          },
        },
        {
          provide: CityValidationService,
          useValue: {
            validate: jest.fn().mockResolvedValue(mockCity),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<RuralPropertiesService>(RuralPropertiesService);
    ruralPropertyRepo = moduleRef.get<Repository<RuralProperty>>(
      getRepositoryToken(RuralProperty),
    );
    userValidationService = moduleRef.get<UserValidationService>(
      UserValidationService,
    );
    producerValidationService = moduleRef.get<ProducerValidationService>(
      ProducerValidationService,
    );
    ruralPropertyValidationService =
      moduleRef.get<RuralPropertyValidationService>(
        RuralPropertyValidationService,
      );
    cityValidationService = moduleRef.get<CityValidationService>(
      CityValidationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new rural property', async () => {
      jest.spyOn(
        ruralPropertyValidationService,
        'validateAreaTotalCanNotBeGreater',
      );
      jest
        .spyOn(producerValidationService, 'validate')
        .mockResolvedValue(mockProducer);
      jest.spyOn(cityValidationService, 'validate').mockResolvedValue(mockCity);
      jest
        .spyOn(ruralPropertyRepo, 'create')
        .mockReturnValue(mockRuralProperty);
      jest
        .spyOn(ruralPropertyRepo, 'save')
        .mockResolvedValue(mockRuralProperty);

      const result = await service.create(
        mockCreateRuralPropertyDto,
        mockUser.id,
      );

      expect(result).toEqual(JSON.parse(JSON.stringify(mockRuralProperty)));
      expect(
        ruralPropertyValidationService.validateAreaTotalCanNotBeGreater,
      ).toHaveBeenCalledWith(
        mockCreateRuralPropertyDto.arable_area,
        mockCreateRuralPropertyDto.vegetation_area,
        mockCreateRuralPropertyDto.total_area,
      );
      expect(producerValidationService.validate).toHaveBeenCalledWith(
        mockCreateRuralPropertyDto.producerId,
      );
      expect(cityValidationService.validate).toHaveBeenCalledWith(
        mockCreateRuralPropertyDto.cityId,
      );
      expect(ruralPropertyRepo.create).toHaveBeenCalled();
      expect(ruralPropertyRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of rural properties serialized', async () => {
      jest
        .spyOn(ruralPropertyRepo, 'find')
        .mockResolvedValue(mockRuralPropertyArray);

      const result = await service.findAll();

      expect(result).toEqual(
        JSON.parse(JSON.stringify(mockRuralPropertyArray)),
      );
      expect(ruralPropertyRepo.find).toHaveBeenCalledWith({
        relations: ['producer', 'city', 'created_by'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single rural property by ID', async () => {
      jest
        .spyOn(ruralPropertyRepo, 'findOne')
        .mockResolvedValue(mockRuralProperty);

      const result = await service.findOne(1);

      expect(result).toEqual(mockRuralProperty);
      expect(ruralPropertyRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('update', () => {
    it('should update the rural property name and area values', async () => {
      jest.spyOn(
        ruralPropertyValidationService,
        'validateAreaTotalCanNotBeGreater',
      );

      jest.spyOn(ruralPropertyRepo, 'merge').mockReturnValue({
        ...mockRuralProperty,
        ...mockUpdateRuralPropertyDto,
      });
      jest.spyOn(ruralPropertyRepo, 'save').mockResolvedValue({
        ...mockRuralProperty,
        ...mockUpdateRuralPropertyDto,
      });

      const result = await service.update(1, mockUpdateRuralPropertyDto);

      expect(result.farm_name).toBe(mockUpdateRuralPropertyDto.farm_name);
      expect(result.arable_area).toBe(mockUpdateRuralPropertyDto.arable_area);
      expect(result.vegetation_area).toBe(
        mockUpdateRuralPropertyDto.vegetation_area,
      );
      expect(result.total_area).toBe(mockUpdateRuralPropertyDto.total_area);
      expect(
        ruralPropertyValidationService.validateAreaTotalCanNotBeGreater,
      ).toHaveBeenCalledWith(
        result.arable_area,
        result.vegetation_area,
        result.total_area,
      );
      expect(ruralPropertyRepo.merge).toHaveBeenCalled();
      expect(ruralPropertyRepo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a rural property by ID', async () => {
      jest
        .spyOn(ruralPropertyValidationService, 'validate')
        .mockResolvedValue(mockRuralProperty);
      jest.spyOn(ruralPropertyRepo, 'remove').mockResolvedValue(mockRuralProperty);

      await service.remove(1);

      expect(ruralPropertyValidationService.validate).toHaveBeenCalledWith(1);
      expect(ruralPropertyRepo.remove).toHaveBeenCalledWith(mockRuralProperty);
    });
  });
});
