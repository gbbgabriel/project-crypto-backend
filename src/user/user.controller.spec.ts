// src/user/user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUserResponseDto = {
    id: '123',
    email: 'user@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserResponseDto;

  const mockJwtPayload = { id: '123', email: 'user@example.com' } as JwtPayload;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findUserById: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the current user profile', async () => {
      userService.findUserById.mockResolvedValue(mockUserResponseDto);

      const result = await controller.getProfile(mockJwtPayload);
      expect(result).toEqual(mockUserResponseDto);
      expect(userService.findUserById).toHaveBeenCalledWith('123');
    });
  });

  describe('findOne', () => {
    it('should return user data if ID matches the current user', async () => {
      userService.findUserById.mockResolvedValue(mockUserResponseDto);

      const result = await controller.findOne('123', mockJwtPayload);
      expect(result).toEqual(mockUserResponseDto);
      expect(userService.findUserById).toHaveBeenCalledWith('123');
    });

    it("should throw ForbiddenException if user tries to access another user's data", async () => {
      await expect(controller.findOne('456', mockJwtPayload)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update and return updated user data if ID matches the current user', async () => {
      const updateData: UpdateUserDto = { name: 'Updated User' };
      const updatedUser = { ...mockUserResponseDto, ...updateData };

      userService.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.update('123', updateData, mockJwtPayload);
      expect(result).toEqual(updatedUser);
      expect(userService.updateUser).toHaveBeenCalledWith('123', updateData);
    });

    it("should throw ForbiddenException if user tries to update another user's data", async () => {
      const updateData: UpdateUserDto = { name: 'Updated User' };

      await expect(
        controller.update('456', updateData, mockJwtPayload),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete the user if ID matches the current user', async () => {
      userService.deleteUser.mockResolvedValue(undefined); // deleteUser returns void

      await expect(
        controller.remove('123', mockJwtPayload),
      ).resolves.toBeUndefined();
      expect(userService.deleteUser).toHaveBeenCalledWith('123');
    });

    it("should throw ForbiddenException if user tries to delete another user's account", async () => {
      await expect(controller.remove('456', mockJwtPayload)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
