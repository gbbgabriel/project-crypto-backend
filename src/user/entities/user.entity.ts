// src/user/entities/user.entity.ts
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Favorite } from '../../crypto/entities/favorite.entity';
import { Conversion } from '../../crypto/entities/conversion.entity';

export class User {
  @ApiProperty({ description: 'Unique identifier for the user' })
  id: string;

  @ApiProperty({ description: 'Name of the user' })
  name: string;

  @ApiProperty({ description: 'Email of the user' })
  email: string;

  @ApiHideProperty()
  password: string;

  @ApiProperty({ description: 'Date when the user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the user was last updated' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the user was deleted (soft delete)',
    required: false,
    nullable: true,
  })
  deletedAt?: Date;

  @ApiProperty({
    description: 'List of favorite cryptocurrencies of the user',
    type: () => [Favorite],
    required: false,
  })
  favorites?: Favorite[];

  @ApiProperty({
    description: 'List of conversions done by the user',
    type: () => [Conversion],
    required: false,
  })
  conversions?: Conversion[];
}
