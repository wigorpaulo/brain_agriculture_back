import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProducersService } from './producers.service';
import { CreateProducerDto } from './dto/create-producer.dto';
import { UpdateProducerDto } from './dto/update-producer.dto';
import { Producer } from './entities/producer.entity';
import { City } from '../cities/entities/city.entity';
import { User } from '../users/entities/user.entity';
import { UserValidationService } from '../common/services/user-validation.service';
import { ProducerValidationService } from '../common/services/producer-validation.service';
import { CityValidationService } from '../common/services/city-validation.service';

describe('ProducersService', () => {
  let service: ProducersService;
  let producerRepo: Repository<Producer>;
  let userValidationService: UserValidationService;
  let producerValidationService: ProducerValidationService;
  let cityValidationService: CityValidationService;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
  } as User;

  const mockCity = {
    id: 1,
    name: 'São Paulo',
  } as City;

  const mockProducer = {
    id: 1,
    name: 'João da Silva',
    cpf_cnpj: '12345678901',
    city: mockCity,
    created_by: mockUser,
  } as Producer;

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
    cpf_cnpj: '80780550056',
    city_id: 1,
  };

  const mockUpdateProducerDto: UpdateProducerDto = {
    name: 'Carlos Pereira Atualizado',
    cpf_cnpj: '26485513019',
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProducersService,
        {
          provide: getRepositoryToken(Producer),
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
            validateCpfCnpjUnique: jest.fn(),
            validate: jest.fn(),
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

    service = moduleRef.get<ProducersService>(ProducersService);
    producerRepo = moduleRef.get<Repository<Producer>>(
      getRepositoryToken(Producer),
    );
    userValidationService = moduleRef.get<UserValidationService>(
      UserValidationService,
    );
    producerValidationService = moduleRef.get<ProducerValidationService>(
      ProducerValidationService,
    );
    cityValidationService = moduleRef.get<CityValidationService>(
      CityValidationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new producer', async () => {
      jest
        .spyOn(producerValidationService, 'validateCpfCnpjUnique')
        .mockResolvedValue();
      jest.spyOn(cityValidationService, 'validate').mockResolvedValue(mockCity);
      jest.spyOn(producerRepo, 'create').mockReturnValue(mockProducer);
      jest.spyOn(producerRepo, 'save').mockResolvedValue(mockProducer);

      const result = await service.create(mockCreateProducerDto, mockUser.id);

      expect(result).toEqual(JSON.parse(JSON.stringify(mockProducer)));
      expect(
        producerValidationService.validateCpfCnpjUnique,
      ).toHaveBeenCalledWith(mockCreateProducerDto.cpf_cnpj);
      expect(cityValidationService.validate).toHaveBeenCalledWith(
        mockCreateProducerDto.city_id,
      );
      expect(producerRepo.create).toHaveBeenCalled();
      expect(producerRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of producers serialized', async () => {
      jest.spyOn(producerRepo, 'find').mockResolvedValue(mockProducerArray);

      const result = await service.findAll();

      expect(result).toEqual(JSON.parse(JSON.stringify(mockProducerArray)));
      expect(producerRepo.find).toHaveBeenCalledWith({
        relations: ['city', 'created_by'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single producer by ID', async () => {
      jest.spyOn(producerRepo, 'findOne').mockResolvedValue(mockProducer);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProducer);
      expect(producerRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('update', () => {
    it('should update the producer name and CPF/CNPJ', async () => {
      jest
        .spyOn(producerValidationService, 'validateCpfCnpjUnique')
        .mockResolvedValue();
      jest
        .spyOn(producerValidationService, 'validate')
        .mockResolvedValue(mockProducer);
      jest.spyOn(producerRepo, 'merge').mockReturnValue({ ...mockProducer, name: 'João da Silva Atualizado' });
      jest.spyOn(producerRepo, 'save').mockResolvedValue({
        ...mockProducer,
        name: mockUpdateProducerDto.name ?? 'João da Silva Atualizado',
        cpf_cnpj: mockUpdateProducerDto.cpf_cnpj ?? '26485513019',
      });

      const result = await service.update(1, mockUpdateProducerDto);

      expect(result.name).toBe(mockUpdateProducerDto.name);
      expect(result.cpf_cnpj).toBe(mockUpdateProducerDto.cpf_cnpj);
      expect(
        producerValidationService.validateCpfCnpjUnique,
      ).toHaveBeenCalledWith(mockUpdateProducerDto.cpf_cnpj);
      expect(producerValidationService.validate).toHaveBeenCalledWith(1);
      expect(producerRepo.merge).toHaveBeenCalled();
      expect(producerRepo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a producer by ID', async () => {
      jest
        .spyOn(producerValidationService, 'validate')
        .mockResolvedValue(mockProducer);
      jest.spyOn(producerRepo, 'remove').mockResolvedValue(mockProducer);

      await service.remove(1);

      expect(producerValidationService.validate).toHaveBeenCalledWith(1);
      expect(producerRepo.remove).toHaveBeenCalledWith(mockProducer);
    });
  });
});
