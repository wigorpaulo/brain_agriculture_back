import { Test, TestingModule } from '@nestjs/testing';
import { RuralPropertiesController } from './rural_properties.controller';
import { RuralPropertiesService } from './rural_properties.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RuralProperty } from './entities/rural_property.entity';
import { UserValidationService } from '../common/services/user-validation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  mockRuralProperty,
  mockRuralPropertyArray,
  mockCreateRuralPropertyDto,
  mockUpdateRuralPropertyDto,
  mockUserValidationService,
} from '../../test/mocks/rural_properties.mocks';
import { mockJwtPayload } from '../../test/mocks/jwt.mocks';

// Mock para evitar erro com @User() decorator
jest.mock('../common/decorators/user.decorator', () => ({
  User: jest.fn().mockImplementation(() => () => {}),
}));

describe('RuralPropertiesController', () => {
  let controller: RuralPropertiesController;
  let service: RuralPropertiesService;

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
