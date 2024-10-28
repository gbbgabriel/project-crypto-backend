// src/user/dto/user-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'user@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Name of the user', example: 'Jane Doe' })
  @Expose()
  name: string;
}
