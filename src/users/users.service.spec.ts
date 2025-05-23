import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserValidationService } from '../common/services/user-validation.service';
import * as bcrypt from 'bcrypt';
import {
  mockUserRepo,
  mockUserValidationService,
} from '../../test/mocks/user.mock';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: UserValidationService,
          useValue: mockUserValidationService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should hash the password, create and save the user', async () => {
      const dto = {
        name: 'John',
        email: 'john@example.com',
        password: '123456',
      };

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      jest.spyOn(bcrypt as any, 'hash').mockResolvedValue(hashedPassword);

      mockUserRepo.create.mockReturnValue({ ...dto, password: hashedPassword });
      mockUserRepo.save.mockResolvedValue({
        id: 1,
        ...dto,
        password: hashedPassword,
      });

      const result = await service.create(dto);

      expect(
        mockUserValidationService.validateEmailUnique,
      ).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: dto.name }),
      );
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({ id: 1, email: dto.email }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [{ id: 1, name: 'John' }];
      mockUserRepo.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockUserRepo.find).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should merge and save updated user data', async () => {
      const dto = { name: 'New Name', password: 'newpass' };
      const id = 1;
      const userFromDb = { id, name: 'Old Name', password: 'oldpass' };
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      mockUserValidationService.validate.mockResolvedValue(userFromDb);
      jest.spyOn(bcrypt as any, 'hash').mockResolvedValue(hashedPassword);

      mockUserRepo.merge.mockReturnValue({
        ...userFromDb,
        ...dto,
        password: hashedPassword,
      });
      mockUserRepo.save.mockResolvedValue({
        id,
        ...dto,
        password: hashedPassword,
      });

      const result = await service.update(id, dto);

      expect(mockUserValidationService.validate).toHaveBeenCalledWith(id);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUserRepo.merge).toHaveBeenCalledWith(
        userFromDb,
        expect.objectContaining({ name: dto.name }),
      );
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ id, name: dto.name }));
    });

    it('should update without changing password if not provided', async () => {
      const dto = { name: 'Only Name' };
      const id = 2;
      const userFromDb = { id, name: 'Old Name', password: 'oldpass' };

      mockUserValidationService.validate.mockResolvedValue(userFromDb);
      mockUserRepo.merge.mockReturnValue({ ...userFromDb, ...dto });
      mockUserRepo.save.mockResolvedValue({ id, ...dto, password: 'oldpass' });

      const result = await service.update(id, dto);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result.name).toBe(dto.name);
    });
  });
});
