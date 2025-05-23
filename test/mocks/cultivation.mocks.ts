import { Cultivation } from '../../src/cultivations/entities/cultivation.entity';
import { CreateCultivationDto } from '../../src/cultivations/dto/create-cultivation.dto';
import { UpdateCultivationDto } from '../../src/cultivations/dto/update-cultivation.dto';
import { mockRuralProperty } from './rural_properties.mocks';
import { mockHarvest, mockHarvestNew } from './harvest.mocks';
import { mockPlantedCulture } from './planted_culture.mocks';
import { mockUser } from './user.mock';

export const mockCultivation = {
  id: 1,
  rural_property: mockRuralProperty,
  harvest: mockHarvest,
  planted_culture: mockPlantedCulture,
  created_by: mockUser,
} as Cultivation;

export const mockCultivationArray = [
  mockCultivation,
  {
    ...mockCultivation,
  },
];

export const mockCreateCultivationDto: CreateCultivationDto = {
  rural_propertyId: mockRuralProperty.id,
  harvestId: mockHarvest.id,
  planted_cultureId: mockPlantedCulture.id,
};
