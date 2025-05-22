import { State } from '../../src/states/entities/state.entity';

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
