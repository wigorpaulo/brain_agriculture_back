import { mockUser, mockUserNew } from './user.mock';
import { PlantedCulture } from '../../src/planted_cultures/entities/planted_culture.entity';
import { CreatePlantedCultureDto } from '../../src/planted_cultures/dto/create-planted_culture.dto';
import { UpdatePlantedCultureDto } from '../../src/planted_cultures/dto/update-planted_culture.dto';

export const mockPlantedCulture = {
  id: 1,
  name: 'Soja',
  created_by: mockUser,
} as PlantedCulture;

export const mockPlantedCultureArray = [
  mockPlantedCulture,
  {
    ...mockPlantedCulture,
    id: 2,
    name: 'Milho',
  },
];

export const mockCreatePlantedCultureDto: CreatePlantedCultureDto = {
  name: 'Trigo',
};

export const mockUpdatePlantedCultureDto: UpdatePlantedCultureDto = {
  name: 'Trigo Atualizado',
};

export const mockPlantedCultureValidationService = {
  validate: jest.fn(),
  validateNameUnique: jest.fn().mockResolvedValue({ id: 1 }),
};

export const mockPlantedCultureNew = {
  id: 1,
  name: 'Soja',
  created_by: mockUserNew,
} as PlantedCulture;

export const mockPlantedCultureArrayNew = [
  mockPlantedCultureNew,
  {
    ...mockPlantedCultureNew,
    id: 2,
    name: 'Milho',
  },
];
