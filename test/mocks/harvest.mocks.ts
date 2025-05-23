import { mockUser, mockUserNew } from './user.mock';
import { Harvest } from '../../src/harvests/entities/harvest.entity';
import { CreateHarvestDto } from '../../src/harvests/dto/create-harvest.dto';
import { UpdateHarvestDto } from '../../src/harvests/dto/update-harvest.dto';
import { HarvestValidationService } from '../../src/common/services/harvest-validation.service';

export const mockHarvest = {
  id: 1,
  name: 'Safra 2024',
  created_by: mockUser,
} as Harvest;

export const mockHarvestArray = [
  mockHarvest,
  {
    ...mockHarvest,
    id: 2,
    name: 'Safra 2025',
  },
];

export const mockCreateHarvestDto: CreateHarvestDto = {
  name: 'Nova Safra',
};

export const mockUpdateHarvestDto: UpdateHarvestDto = {
  name: 'Safra 2024 Atualizada',
};

export const mockHarvestValidationService = {
  validate: jest.fn(),
  validateNameUnique: jest.fn(),
};

export const mockHarvestNew = {
  id: 1,
  name: 'Safra 2024',
  created_by: mockUserNew,
} as Harvest;

export const mockHarvestArrayNew = [
  { ...mockHarvestNew, id: 1 },
  { ...mockHarvestNew, id: 2, name: 'Safra 2025' },
];
