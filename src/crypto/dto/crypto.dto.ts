// src/crypto/dto/crypto.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class ConvertCryptoDto {
  @ApiProperty({
    description: 'Name or symbol of the cryptocurrency to be converted',
    example: 'bitcoin',
  })
  @IsString()
  @IsNotEmpty({ message: 'Cryptocurrency name or symbol is required' })
  @MinLength(3, {
    message: 'Cryptocurrency name must be at least 3 characters long',
  })
  @MaxLength(30, {
    message: 'Cryptocurrency name must not exceed 30 characters',
  })
  crypto: string;

  @ApiProperty({
    description: 'Amount of cryptocurrency to convert. Must be greater than 0',
    example: 1.5,
  })
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;
}

export class FavoriteCryptoDto {
  @ApiProperty({
    description: 'Name or symbol of the cryptocurrency to add to favorites',
    example: 'ethereum',
  })
  @IsString()
  @IsNotEmpty({ message: 'Cryptocurrency name or symbol is required' })
  @MinLength(3, {
    message: 'Cryptocurrency name must be at least 3 characters long',
  })
  @MaxLength(30, {
    message: 'Cryptocurrency name must not exceed 30 characters',
  })
  crypto: string;
}
