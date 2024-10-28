import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should register a new user and return an access token', async () => {
      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const tokenResponse = { access_token: 'mock_access_token' };
      mockAuthService.signup.mockResolvedValueOnce(tokenResponse);

      const result = await controller.signup(signUpDto);

      expect(result).toEqual(tokenResponse);
      expect(authService.signup).toHaveBeenCalledWith(signUpDto);
    });

    it('should throw a ConflictException if the user already exists', async () => {
      const signUpDto: SignUpDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };
      mockAuthService.signup.mockRejectedValueOnce(
        new ConflictException('User with this email already exists'),
      );

      await expect(controller.signup(signUpDto)).rejects.toThrow(
        ConflictException,
      );
      expect(authService.signup).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('login', () => {
    it('should log in a user and return an access token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const tokenResponse = { access_token: 'mock_access_token' };
      mockAuthService.login.mockResolvedValueOnce(tokenResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(tokenResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw UnauthorizedException if the credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };
      mockAuthService.login.mockRejectedValueOnce(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
