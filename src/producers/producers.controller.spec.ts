import { Test, TestingModule } from '@nestjs/testing';
import { ProducersController } from './producers.controller';
import { ProducersService } from './producers.service';
import { CreateProducerDto } from './dto/create-producer.dto';
import { UpdateProducerDto } from './dto/update-producer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Producer } from './entities/producer.entity';
import { State } from '../states/entities/state.entity';
import { City } from '../cities/entities/city.entity';
import { UserValidationService } from '../common/services/user-validation.service';

// Mock para evitar erro com @User() decorator
jest.mock('../common/decorators/user.decorator', () => ({
  User: jest.fn().mockImplementation(() => () => {}),
}));

describe('ProducersController', () => {
  let controller: ProducersController;
  let service: ProducersService;

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

  const mockProducerArray = [
    mockProducer,
    {
      ...mockProducer,
      id: 2,
      name: 'Maria Oliveira',
    },
  ];

  const mockCreateProducerDto: CreateProducerDto = {
    name: 'Carlos Pereira',
    cpf_cnpj: '11122233344',
    city_id: mockCity.id,
  };

  const mockUpdateProducerDto: UpdateProducerDto = {
    name: 'Carlos Pereira Atualizado',
  };

  const mockUserValidationService = {
    validate: jest.fn(),
    validateEmailUnique: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProducersController],
      providers: [
        {
          provide: ProducersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Producer),
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

    controller = module.get<ProducersController>(ProducersController);
    service = module.get<ProducersService>(ProducersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a producer with user ID from @User()', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockProducer);

      const result = await controller.create(
        mockCreateProducerDto,
        mockJwtPayload,
      );

      expect(result).toEqual(mockProducer);
      expect(service.create).toHaveBeenCalledWith(
        mockCreateProducerDto,
        mockJwtPayload.sub,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of producers', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(mockProducerArray);

      const result = await controller.findAll();

      expect(result).toBe(mockProducerArray);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single producer by ID', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProducer);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockProducer);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a producer by ID', async () => {
      jest.spyOn(service, 'update').mockResolvedValue(mockProducer);

      const result = await controller.update('1', mockUpdateProducerDto);

      expect(result).toEqual(mockProducer);
      expect(service.update).toHaveBeenCalledWith(1, mockUpdateProducerDto);
    });
  });

  describe('remove', () => {
    it('should delete a producer by ID', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
