import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UserRepository } from '../user/repositories/user.repository';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  async signup(signUpDto: SignUpDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findActiveUserByEmail(
      signUpDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hash = await bcrypt.hash(signUpDto.password, 10);
    const user = await this.userRepository.createUser(
      signUpDto.email,
      hash,
      signUpDto.name,
    );

    const token = await this.signToken(user.id, user.email);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      access_token: token.access_token,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findActiveUserByEmail(
      loginDto.email,
    );

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.signToken(user.id, user.email);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      access_token: token.access_token,
    };
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload: JwtPayload = { id: userId, email };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }
}
