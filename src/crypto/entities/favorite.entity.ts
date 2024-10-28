// src/crypto/entities/favorite.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export class Favorite {
  @ApiProperty({ description: 'Unique identifier for the favorite entry' })
  id: number;

  @ApiProperty({ description: 'Name of the cryptocurrency added to favorites' })
  crypto: string;

  @ApiProperty({ description: 'User ID who added the favorite' })
  userId: number;

  @ApiProperty({ description: 'User who added the favorite', type: () => User })
  user: User;
}
