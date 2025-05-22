import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/city.entity';
import { State } from '../states/entities/state.entity';
import { CityValidationService } from '../common/services/city-validation.service';
import { StateValidationService } from '../common/services/state-validation.service';

describe('CitiesService', () => {
  let service: CitiesService;
  let cityRepo: Repository<City>;
  let cityValidationService: CityValidationService;
  let stateValidationService: StateValidationService;

  const mockState = new State();
  mockState.id = 1;
  mockState.name = 'São Paulo';
  mockState.uf = 'SP';
  mockState.created_at = new Date();
  mockState.updated_at = new Date();

  const mockCity = new City();
  mockCity.id = 1;
  mockCity.name = 'São Paulo';
  mockCity.state = mockState;
  mockCity.created_at = new Date();
  mockCity.updated_at = new Date();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useClass: Repository,
        },
        {
          provide: CityValidationService,
          useValue: {
            validateNameUnique: jest.fn(),
            validate: jest.fn(),
          },
        },
        {
          provide: StateValidationService,
          useValue: {
            validate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<CitiesService>(CitiesService);
    cityRepo = moduleRef.get<Repository<City>>(getRepositoryToken(City));
    cityValidationService = moduleRef.get<CityValidationService>(
      CityValidationService,
    );
    stateValidationService = moduleRef.get<StateValidationService>(
      StateValidationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCityDto: CreateCityDto = {
      name: 'Curitiba',
      state_id: 1,
    };

    it('should create and return a new city', async () => {
      jest
        .spyOn(cityValidationService, 'validateNameUnique')
        .mockResolvedValue();
      jest
        .spyOn(stateValidationService, 'validate')
        .mockResolvedValue(mockState);
      jest.spyOn(cityRepo, 'create').mockReturnValue(mockCity);
      jest.spyOn(cityRepo, 'save').mockResolvedValue(mockCity);

      const result = await service.create(createCityDto);

      expect(result).toEqual(mockCity);
      expect(cityValidationService.validateNameUnique).toHaveBeenCalledWith(
        createCityDto.name,
      );
      expect(stateValidationService.validate).toHaveBeenCalledWith(
        createCityDto.state_id,
      );
      expect(cityRepo.create).toHaveBeenCalled();
      expect(cityRepo.save).toHaveBeenCalledWith(
        expect.objectContaining(mockCity),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of cities', async () => {
      jest.spyOn(cityRepo, 'find').mockResolvedValue([mockCity]);

      const result = await service.findAll();

      expect(result).toEqual([mockCity]);
      expect(cityRepo.find).toHaveBeenCalledWith({ relations: ['state'] });
    });
  });

  describe('findOne', () => {
    it('should return a single city by ID', async () => {
      jest.spyOn(cityRepo, 'findOne').mockResolvedValue(mockCity);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCity);
      expect(cityRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('update', () => {
    const updateCityDto: UpdateCityDto = {
      name: 'Curitiba Atualizada',
      state_id: 2,
    };

    const mockUpdatedCity = { ...mockCity, name: updateCityDto.name };

    it('should update city name and state', async () => {
      jest
        .spyOn(cityValidationService, 'validateNameUnique')
        .mockResolvedValue();
      jest
        .spyOn(stateValidationService, 'validate')
        .mockResolvedValue(mockState);
      jest.spyOn(cityValidationService, 'validate').mockResolvedValue(mockCity);
      jest.spyOn(cityRepo, 'merge').mockReturnValue(mockUpdatedCity as City);
      jest.spyOn(cityRepo, 'save').mockResolvedValue(mockUpdatedCity as City);

      const result = await service.update(1, updateCityDto);

      expect(result).toEqual(mockUpdatedCity);
      expect(cityValidationService.validateNameUnique).toHaveBeenCalledWith(
        updateCityDto.name,
      );
      expect(stateValidationService.validate).toHaveBeenCalledWith(
        updateCityDto.state_id,
      );
      expect(cityValidationService.validate).toHaveBeenCalledWith(1);
      expect(cityRepo.merge).toHaveBeenCalled();
      expect(cityRepo.save).toHaveBeenCalled();
    });

    it('should only update name if state_id is not provided', async () => {
      jest
        .spyOn(cityValidationService, 'validateNameUnique')
        .mockResolvedValue();
      jest.spyOn(cityValidationService, 'validate').mockResolvedValue(mockCity);
      jest.spyOn(cityRepo, 'merge').mockReturnValue(mockUpdatedCity as City);
      jest.spyOn(cityRepo, 'save').mockResolvedValue(mockUpdatedCity as City);

      const result = await service.update(1, { name: 'Novo Nome' });

      expect(result).toEqual(mockUpdatedCity);
      expect(cityValidationService.validateNameUnique).toHaveBeenCalledWith(
        'Novo Nome',
      );
      expect(stateValidationService.validate).not.toHaveBeenCalled();
      expect(cityRepo.merge).toHaveBeenCalled();
      expect(cityRepo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a city by ID', async () => {
      jest.spyOn(cityValidationService, 'validate').mockResolvedValue(mockCity);
      jest.spyOn(cityRepo, 'remove').mockResolvedValue(mockCity);

      await service.remove(1);

      expect(cityValidationService.validate).toHaveBeenCalledWith(1);
      expect(cityRepo.remove).toHaveBeenCalledWith(mockCity);
    });
  });
});
