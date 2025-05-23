import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { mockAuthService } from '../../test/mocks/auth.mocks';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token on valid credentials', async () => {
      const loginDto: CreateAuthDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = { id: 1, email: loginDto.email };
      const mockToken = { access_token: 'fake-jwt-token' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser as any);
      jest.spyOn(authService as any, 'login').mockResolvedValue(mockToken);

      const result = await controller.login(loginDto);

      expect(authService.validateUser).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockToken);
    });
  });
});
