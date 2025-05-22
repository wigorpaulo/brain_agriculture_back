import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { City } from './entities/city.entity';
import { State } from '../states/entities/state.entity';
import { CityValidationService } from '../common/services/city-validation.service';
import { StateValidationService } from '../common/services/state-validation.service';

describe('CitiesController', () => {
  let controller: CitiesController;
  let service: CitiesService;
  let repository: Repository<City>;

  const mockState: State = {
    id: 1,
    name: 'São Paulo',
    uf: 'SP',
    created_at: new Date(),
    updated_at: new Date(),
  } as State;

  const mockCity = {
    id: 1,
    name: 'São Paulo',
    state: mockState,
    created_at: new Date(),
    updated_at: new Date(),
  } as City;

  const mockCityArray = [
    { ...mockCity, id: 1 },
    { ...mockCity, id: 2, name: 'Rio de Janeiro' },
  ];

  const mockCreateCityDto: CreateCityDto = {
    name: 'Curitiba',
    state_id: 1,
  };

  const mockUpdateCityDto: UpdateCityDto = {
    name: 'Curitiba Atualizada',
    state_id: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [
        CitiesService,
        {
          provide: getRepositoryToken(City),
          useClass: class MockRepository {
            findOne = jest.fn();
            find = jest.fn();
            save = jest.fn();
            delete = jest.fn();
          },
        },
        {
          provide: CityValidationService,
          useValue: {
            validateNameUnique: jest.fn(),
            validate: jest.fn(),
            // adicione aqui outros métodos usados nos testes
          },
        },
        {
          provide: StateValidationService,
          useValue: {
            validate: jest.fn(),
            // adicione outros métodos conforme necessário
          },
        },
      ],
    }).compile();

    controller = module.get<CitiesController>(CitiesController);
    service = module.get<CitiesService>(CitiesService);
    repository = module.get<Repository<City>>(getRepositoryToken(City));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a city', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockCity);

      const result = await controller.create(mockCreateCityDto);

      expect(result).toEqual(mockCity);
      expect(service.create).toHaveBeenCalledWith(mockCreateCityDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of cities', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(mockCityArray);

      const result = await controller.findAll();

      expect(result).toBe(mockCityArray);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single city by ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCity);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockCity);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a city by ID', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockCity);

      const result = await controller.update('1', mockUpdateCityDto);

      expect(result).toEqual(mockCity);
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateCityDto);
    });
  });

  describe('remove', () => {
    it('should delete a city by ID', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
