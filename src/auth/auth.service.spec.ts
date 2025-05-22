import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    const loginDto: CreateAuthDto = {
      email: 'user@example.com',
      password: 'password123',
    };

    it('should validate and return user without password', async () => {
      const mockUser: Partial<User> = {
        id: 1,
        email: loginDto.email,
        name: 'Test User',
        password: await bcrypt.hash(loginDto.password, 10),
      };

      jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(true);
      userRepo.findOne.mockResolvedValue(mockUser as User);

      const result = await service.validateUser(loginDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.validateUser(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is missing', async () => {
      const mockUser = { ...loginDto, password: null };
      userRepo.findOne.mockResolvedValue(mockUser as any);

      await expect(service.validateUser(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: 1,
        email: loginDto.email,
        name: 'Test User',
        password: 'hashed_password',
      } as User;

      jest.spyOn(bcrypt as any, 'compare').mockResolvedValue(false);
      userRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.validateUser(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return an access token and user info', () => {
      const user: Partial<Omit<User, 'password'>> = {
        id: 1,
        email: 'user@example.com',
        name: 'Test User',
      };

      const result = service.login(user as Omit<User, 'password'>);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: user.email, sub: user.id },
        { expiresIn: '1h' },
      );

      expect(result).toEqual({
        access_token: 'mocked-jwt-token',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    });
  });
});
