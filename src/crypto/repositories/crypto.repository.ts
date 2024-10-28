// src/crypto/repositories/crypto.repository.ts

import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Conversion, Favorite } from '@prisma/client';

@Injectable()
export class CryptoRepository {
  private readonly logger = new Logger(CryptoRepository.name);

  constructor(private prisma: PrismaService) {}

  async saveConversion(
    userId: string,
    crypto: string,
    amount: number,
    valueBRL: number,
    valueUSD: number,
  ): Promise<Conversion> {
    try {
      this.logger.log(
        `Saving conversion for user ${userId} - Crypto: ${crypto}`,
      );
      return await this.prisma.conversion.create({
        data: { userId, crypto, amount, valueBRL, valueUSD },
      });
    } catch (error) {
      this.logger.error(
        `Failed to save conversion for user ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to save conversion');
    }
  }

  async findFavorite(userId: string, crypto: string): Promise<Favorite | null> {
    return this.prisma.favorite.findFirst({
      where: { userId, crypto },
    });
  }

  async addFavorite(userId: string, crypto: string): Promise<Favorite> {
    try {
      this.logger.log(
        `Adding favorite crypto for user ${userId} - Crypto: ${crypto}`,
      );
      return await this.prisma.favorite.create({
        data: { userId, crypto },
      });
    } catch (error) {
      this.logger.error(
        `Failed to add favorite for user ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to add favorite');
    }
  }

  async removeFavorite(
    userId: string,
    crypto: string,
  ): Promise<{ count: number }> {
    const result = await this.prisma.favorite.deleteMany({
      where: { userId, crypto },
    });
    this.logger.log(
      `Removed ${result.count} favorite(s) for user ${userId} - Crypto: ${crypto}`,
    );
    return { count: result.count };
  }

  async getHistory(userId: string): Promise<Conversion[]> {
    this.logger.log(`Fetching conversion history for user ${userId}`);
    return this.prisma.conversion.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    this.logger.log(`Fetching favorites for user ${userId}`);
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }
}
