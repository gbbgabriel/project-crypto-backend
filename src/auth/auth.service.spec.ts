import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/repositories/user.repository';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userRepository: UserRepository;

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUserRepository = {
    findActiveUserByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should throw ConflictException if user with email already exists', async () => {
      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      mockUserRepository.findActiveUserByEmail.mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
      });

      await expect(service.signup(signUpDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create a new user and return user details with an access token', async () => {
      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      };
      mockUserRepository.findActiveUserByEmail.mockResolvedValueOnce(null); // No user with that email
      mockUserRepository.createUser.mockResolvedValueOnce({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password');
      mockJwtService.signAsync.mockResolvedValueOnce('access_token');

      const result = await service.signup(signUpDto);
      expect(result).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        access_token: 'access_token',
      });
      expect(userRepository.createUser).toHaveBeenCalledWith(
        signUpDto.email,
        'hashed_password',
        signUpDto.name,
      );
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user does not exist', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password',
      };
      mockUserRepository.findActiveUserByEmail.mockResolvedValueOnce(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed_password',
      };
      mockUserRepository.findActiveUserByEmail.mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user details with an access token if login is successful', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
      };
      mockUserRepository.findActiveUserByEmail.mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
      mockJwtService.signAsync.mockResolvedValueOnce('access_token');

      const result = await service.login(loginDto);
      expect(result).toEqual({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        access_token: 'access_token',
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: '1',
        email: 'test@example.com',
      });
    });
  });

  describe('signToken', () => {
    it('should sign a token with user ID and email', async () => {
      mockJwtService.signAsync.mockResolvedValueOnce('signed_token');
      const result = await service.signToken('1', 'test@example.com');

      expect(result).toEqual({ access_token: 'signed_token' });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        id: '1',
        email: 'test@example.com',
      });
    });
  });
});
