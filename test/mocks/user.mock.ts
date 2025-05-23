import { mockJwtPayload } from './jwt.mocks';
import { User } from '../../src/users/entities/user.entity';
import { ProducersService } from '../../src/producers/producers.service';

export const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

export const mockUserRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  merge: jest.fn(),
};

export const mockUserValidationService = {
  validate: jest.fn(),
  validateEmailUnique: jest.fn(),
};

export const mockUser = {
  id: Number(mockJwtPayload.sub),
  name: 'Test User',
  email: mockJwtPayload.email,
} as User;

export const mockUserNew = {
  id: 1,
  email: 'test@example.com',
} as User;

export const mockProducersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};
