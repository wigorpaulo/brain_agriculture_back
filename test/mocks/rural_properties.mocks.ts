import { mockUser } from './user.mock';
import { RuralProperty } from '../../src/rural_properties/entities/rural_property.entity';
import { mockCity } from './city.mock';
import { mockProducer } from './producer.mocks';
import { CreateRuralPropertyDto } from '../../src/rural_properties/dto/create-rural_property.dto';
import { UpdateRuralPropertyDto } from '../../src/rural_properties/dto/update-rural_property.dto';

export const mockRuralProperty = {
  id: 1,
  farm_name: 'Fazenda Bela Vista',
  total_area: 8,
  arable_area: 4,
  vegetation_area: 4,
  created_by: mockUser,
  city: mockCity,
  producer: mockProducer,
} as RuralProperty;

export const mockRuralPropertyArray = [
  mockRuralProperty,
  {
    ...mockRuralProperty,
    id: 2,
    farm_name: 'Chácara Verde',
  },
];

export const mockCreateRuralPropertyDto: CreateRuralPropertyDto = {
  farm_name: 'Sítio das Árvores',
  total_area: 30,
  arable_area: 15,
  vegetation_area: 15,
  cityId: mockCity.id,
  producerId: mockProducer.id,
};

export const mockUpdateRuralPropertyDto: UpdateRuralPropertyDto = {
  farm_name: 'Sítio das Árvores Atualizado',
};

export const mockUserValidationService = {
  validate: jest.fn(),
  validateEmailUnique: jest.fn().mockResolvedValue({ id: 1 }),
};
