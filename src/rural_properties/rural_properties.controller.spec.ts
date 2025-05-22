import { Test, TestingModule } from '@nestjs/testing';
import { RuralPropertiesController } from './rural_properties.controller';
import { RuralPropertiesService } from './rural_properties.service';
import { CreateRuralPropertyDto } from './dto/create-rural_property.dto';
import { UpdateRuralPropertyDto } from './dto/update-rural_property.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { Producer } from '../producers/entities/producer.entity';
import { State } from '../states/entities/state.entity';
import { City } from '../cities/entities/city.entity';
import { RuralProperty } from './entities/rural_property.entity';
import { UserValidationService } from '../common/services/user-validation.service';
import { getRepositoryToken } from '@nestjs/typeorm';

// Mock para evitar erro com @User() decorator
jest.mock('../common/decorators/user.decorator', () => ({
  User: jest.fn().mockImplementation(() => () => {}),
}));

describe('RuralPropertiesController', () => {
  let controller: RuralPropertiesController;
  let service: RuralPropertiesService;

  const mockJwtPayload: JwtPayload = {
    sub: 1,
    email: 'test@example.com',
  };

  const mockUser = {
    id: Number(mockJwtPayload.sub),
    name: 'Test User',
    email: mockJwtPayload.email,
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
      farm_name: 'Chácara Verde',
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
  };

  const mockUserValidationService = {
    validate: jest.fn(),
    validateEmailUnique: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RuralPropertiesController],
      providers: [
        {
          provide: RuralPropertiesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RuralProperty),
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

    controller = module.get<RuralPropertiesController>(
      RuralPropertiesController,
    );
    service = module.get<RuralPropertiesService>(RuralPropertiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a rural property with user ID from @User()', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockRuralProperty);

      const result = await controller.create(
        mockCreateRuralPropertyDto,
        mockJwtPayload,
      );

      expect(result).toEqual(mockRuralProperty);
      expect(service.create).toHaveBeenCalledWith(
        mockCreateRuralPropertyDto,
        mockJwtPayload.sub,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of rural properties', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(mockRuralPropertyArray);

      const result = await controller.findAll();

      expect(result).toBe(mockRuralPropertyArray);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single rural property by ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockRuralProperty);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockRuralProperty);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a rural property by ID', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockRuralProperty);

      const result = await controller.update('1', mockUpdateRuralPropertyDto);

      expect(result).toEqual(mockRuralProperty);
      expect(service.update).toHaveBeenCalledWith(
        1,
        mockUpdateRuralPropertyDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a rural property by ID', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
