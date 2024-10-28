import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserRepository } from './repositories/user.repository';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUserById(id: string): Promise<UserResponseDto> {
    const user = await this.findUserOrFail(id);
    return plainToInstance(UserResponseDto, user);
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponseDto> {
    await this.findUserOrFail(id);
    const updatedUser = await this.userRepository.updateUser(id, data);
    return plainToInstance(UserResponseDto, updatedUser);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.findUserOrFail(id);
    await this.userRepository.updateUser(id, {
      deletedAt: new Date(),
      email: `${user.email}_deleted_${user.id}`,
    });
  }

  private async findUserOrFail(id: string): Promise<User> {
    const user = await this.userRepository.findUserById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found.`);
    return user;
  }
}
