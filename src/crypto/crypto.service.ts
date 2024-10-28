import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { CryptoRepository } from './repositories/crypto.repository';
import { ConvertCryptoDto, FavoriteCryptoDto } from './dto/crypto.dto';
import { CryptoNotFoundException } from './exceptions/crypto-not-found.exception';
import { FavoriteAlreadyExistsException } from './exceptions/favorite-already-exists.exception';
import { RateLimiterService } from '../common/services/rate-limiter.service';
import { ErrorHandlerService } from '../common/services/error-handler.service';
import { Conversion, Favorite } from '@prisma/client';

@Injectable()
export class CryptoService {
  constructor(
    private readonly cryptoRepo: CryptoRepository,
    private readonly http: HttpService,
    private readonly rateLimiter: RateLimiterService,
    private readonly errorHandler: ErrorHandlerService,
  ) {}

  private async handleRequest<T>(request: () => Promise<T>): Promise<T> {
    this.rateLimiter.throwIfBlocked();
    try {
      return await request();
    } catch (error) {
      this.errorHandler.handleApiError(error);
      throw error;
    }
  }

  async getCryptoList(): Promise<{ id: string; name: string }[]> {
    const url = 'https://api.coingecko.com/api/v3/coins/list';
    return this.handleRequest(async () =>
      lastValueFrom(
        this.http.get(url).pipe(
          map((response) =>
            response.data.map((coin: any) => ({
              id: coin.id,
              name: coin.name,
            })),
          ),
          catchError((error) => {
            this.errorHandler.handleApiError(error);
            throw new HttpException(
              'Failed to fetch crypto list from CoinGecko',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      ),
    );
  }

  async convertCrypto(
    userId: string,
    dto: ConvertCryptoDto,
  ): Promise<{ valueBRL: number; valueUSD: number }> {
    const { crypto, amount } = dto;
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=brl,usd`;

    const response = await this.handleRequest(async () =>
      lastValueFrom(
        this.http.get(url).pipe(
          map((res) => res.data),
          catchError((error) => {
            this.errorHandler.handleApiError(error);
            throw new HttpException(
              'Failed to fetch conversion rates after multiple attempts',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      ),
    );

    const prices = response[crypto];
    if (!prices) throw new CryptoNotFoundException(crypto);

    const valueBRL = amount * prices.brl;
    const valueUSD = amount * prices.usd;

    await this.cryptoRepo.saveConversion(
      userId,
      crypto,
      amount,
      valueBRL,
      valueUSD,
    );
    return { valueBRL, valueUSD };
  }

  async addFavorite(userId: string, dto: FavoriteCryptoDto): Promise<Favorite> {
    const favoriteExists = await this.cryptoRepo.findFavorite(
      userId,
      dto.crypto,
    );
    if (favoriteExists) throw new FavoriteAlreadyExistsException(dto.crypto);

    return this.cryptoRepo.addFavorite(userId, dto.crypto);
  }

  async removeFavorite(
    userId: string,
    dto: FavoriteCryptoDto,
  ): Promise<{ count: number }> {
    return this.cryptoRepo.removeFavorite(userId, dto.crypto);
  }

  async getHistory(userId: string): Promise<Conversion[]> {
    return this.cryptoRepo.getHistory(userId);
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return this.cryptoRepo.getFavorites(userId);
  }
}
