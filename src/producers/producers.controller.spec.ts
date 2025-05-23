import { Test, TestingModule } from '@nestjs/testing';
import { ProducersController } from './producers.controller';
import { ProducersService } from './producers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Producer } from './entities/producer.entity';
import { UserValidationService } from '../common/services/user-validation.service';
import { mockProducersService, mockUserValidationService } from '../../test/mocks/user.mock';
import { mockJwtPayload } from '../../test/mocks/jwt.mocks';
import { mockProducer } from '../../test/mocks/producer.mocks';
import {
  mockProducerArray,
  mockCreateProducerDto,
  mockUpdateProducerDto,
} from '../../test/mocks/producer.mocks';

// Mock para evitar erro com @User() decorator
jest.mock('../common/decorators/user.decorator', () => ({
  User: jest.fn().mockImplementation(() => () => {}),
}));

describe('ProducersController', () => {
  let controller: ProducersController;
  let service: ProducersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProducersController],
      providers: [
        {
          provide: ProducersService,
          useValue: mockProducersService,
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
