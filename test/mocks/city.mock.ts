import { mockState } from './state.mock';
import { City } from '../../src/cities/entities/city.entity';
import { CreateCityDto } from '../../src/cities/dto/create-city.dto';
import { UpdateCityDto } from '../../src/cities/dto/update-city.dto';
import { CityValidationService } from '../../src/common/services/city-validation.service';

export const mockCity = {
  id: 1,
  name: 'São Paulo',
  state: mockState,
  created_at: new Date(),
  updated_at: new Date(),
} as City;

export const mockCityArray = [
  { ...mockCity, id: 1 },
  { ...mockCity, id: 2, name: 'Rio de Janeiro' },
];

export const mockCreateCityDto: CreateCityDto = {
  name: 'Curitiba',
  state_id: 1,
};

export const mockUpdateCityDto: UpdateCityDto = {
  name: 'Curitiba Atualizada',
  state_id: 1,
};

export const mockCityValidationService = {
  validateNameUnique: jest.fn(),
  validate: jest.fn(),
};

export class MockRepository {
  findOne = jest.fn();
  find = jest.fn();
  save = jest.fn();
  delete = jest.fn();
}
