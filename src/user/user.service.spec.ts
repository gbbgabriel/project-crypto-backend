import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './repositories/user.repository';
import { UserResponseDto } from './dto/user-response.dto';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    id: '123',
    email: 'user@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as User;

  const mockDeletedUser = {
    ...mockUser,
    email: 'user@example.com_deleted_123',
    deletedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findUserById: jest.fn(),
            updateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUserById', () => {
    it('should return user data when user exists', async () => {
      userRepository.findUserById.mockResolvedValueOnce(mockUser);

      const result = await service.findUserById('123');
      expect(result).toEqual(plainToInstance(UserResponseDto, mockUser));
      expect(userRepository.findUserById).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      userRepository.findUserById.mockResolvedValueOnce(null);

      await expect(service.findUserById('123')).rejects.toThrow(NotFoundException);
      expect(userRepository.findUserById).toHaveBeenCalledWith('123');
    });
  });

  describe('updateUser', () => {
    it('should update user data and return updated user', async () => {
      const updateData: UpdateUserDto = { name: 'Updated User' };
      const updatedUser = { ...mockUser, ...updateData };

      userRepository.findUserById.mockResolvedValueOnce(mockUser);
      userRepository.updateUser.mockResolvedValueOnce(updatedUser);

      const result = await service.updateUser('123', updateData);
      expect(result).toEqual(plainToInstance(UserResponseDto, updatedUser));
      expect(userRepository.findUserById).toHaveBeenCalledWith('123');
      expect(userRepository.updateUser).toHaveBeenCalledWith('123', updateData);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.findUserById.mockResolvedValueOnce(null);

      await expect(service.updateUser('123', { name: 'Updated User' })).rejects.toThrow(NotFoundException);
      expect(userRepository.findUserById).toHaveBeenCalledWith('123');
    });
  });

  describe('deleteUser', () => {
    it('should mark user as deleted by updating email and setting deletedAt', async () => {
      userRepository.findUserById.mockResolvedValueOnce(mockUser);
      userRepository.updateUser.mockResolvedValueOnce(mockDeletedUser);

      await service.deleteUser('123');
      expect(userRepository.findUserById).toHaveBeenCalledWith('123');
      expect(userRepository.updateUser).toHaveBeenCalledWith('123', {
        deletedAt: expect.any(Date),
        email: `${mockUser.email}_deleted_${mockUser.id}`,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.findUserById.mockResolvedValueOnce(null);

      await expect(service.deleteUser('123')).rejects.toThrow(NotFoundException);
      expect(userRepository.findUserById).toHaveBeenCalledWith('123');
    });
  });
});
