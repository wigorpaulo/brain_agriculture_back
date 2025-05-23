import { State } from '../../src/states/entities/state.entity';
import { StateValidationService } from '../../src/common/services/state-validation.service';

export const mockState = {
  id: 1,
  name: 'São Paulo',
  uf: 'SP',
  created_at: new Date(),
  updated_at: new Date(),
} as State;

export const mockStatesService = {
  create: jest.fn().mockResolvedValue(mockState),
  findAll: jest.fn().mockResolvedValue([mockState]),
  findOne: jest.fn().mockResolvedValue(mockState),
  update: jest.fn().mockResolvedValue({ ...mockState, name: 'Rio de Janeiro' }),
  remove: jest.fn().mockResolvedValue(undefined),
};

export const mockStateValidationService = {
  validate: jest.fn(),
};

export const mockRepositoryService = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
};
