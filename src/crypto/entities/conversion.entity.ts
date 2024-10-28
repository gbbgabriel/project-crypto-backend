// src/crypto/entities/conversion.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export class Conversion {
  @ApiProperty({ description: 'Unique identifier for the conversion entry' })
  id: number;

  @ApiProperty({ description: 'Name of the cryptocurrency converted' })
  crypto: string;

  @ApiProperty({ description: 'Amount of cryptocurrency converted' })
  amount: number;

  @ApiProperty({ description: 'Value in BRL after conversion' })
  valueBRL: number;

  @ApiProperty({ description: 'Value in USD after conversion' })
  valueUSD: number;

  @ApiProperty({ description: 'User ID who performed the conversion' })
  userId: number;

  @ApiProperty({
    description: 'User who performed the conversion',
    type: () => User,
  })
  user: User;
}
