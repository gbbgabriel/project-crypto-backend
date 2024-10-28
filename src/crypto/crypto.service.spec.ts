// src/crypto/crypto.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { CryptoService } from './crypto.service';
import { CryptoRepository } from './repositories/crypto.repository';
import { RateLimiterService } from '../common/services/rate-limiter.service';
import { ErrorHandlerService } from '../common/services/error-handler.service';
import { ConvertCryptoDto, FavoriteCryptoDto } from './dto/crypto.dto';
import { CryptoNotFoundException } from './exceptions/crypto-not-found.exception';
import { FavoriteAlreadyExistsException } from './exceptions/favorite-already-exists.exception';
import { Conversion, Favorite } from '@prisma/client';
import { AxiosResponse, AxiosHeaders } from 'axios';

describe('CryptoService', () => {
  let service: CryptoService;
  let cryptoRepo: CryptoRepository;
  let httpService: HttpService;
  let rateLimiter: RateLimiterService;
  let errorHandler: ErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: CryptoRepository,
          useValue: {
            saveConversion: jest.fn(),
            findFavorite: jest.fn(),
            addFavorite: jest.fn(),
            removeFavorite: jest.fn(),
            getHistory: jest.fn(),
            getFavorites: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: RateLimiterService,
          useValue: {
            throwIfBlocked: jest.fn(),
          },
        },
        {
          provide: ErrorHandlerService,
          useValue: {
            handleApiError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
    cryptoRepo = module.get<CryptoRepository>(CryptoRepository);
    httpService = module.get<HttpService>(HttpService);
    rateLimiter = module.get<RateLimiterService>(RateLimiterService);
    errorHandler = module.get<ErrorHandlerService>(ErrorHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCryptoList', () => {
    it('should return a list of cryptocurrencies', async () => {
      const mockCryptoList = [
        { id: 'bitcoin', name: 'Bitcoin' },
        { id: 'ethereum', name: 'Ethereum' },
      ];
      const axiosResponse: AxiosResponse = {
        data: mockCryptoList,
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      const result = await service.getCryptoList();
      expect(result).toEqual(mockCryptoList);
    });

    it('should throw an HttpException when the API fails', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(
          throwError(
            () =>
              new HttpException('API error', HttpStatus.SERVICE_UNAVAILABLE),
          ),
        );
      jest.spyOn(errorHandler, 'handleApiError').mockImplementation(() => {});

      await expect(service.getCryptoList()).rejects.toThrow(HttpException);
    });
  });

  describe('convertCrypto', () => {
    it('should convert crypto and save the conversion', async () => {
      const dto: ConvertCryptoDto = { crypto: 'bitcoin', amount: 2 };
      const mockApiResponse = { bitcoin: { brl: 100, usd: 50 } };
      const axiosResponse: AxiosResponse = {
        data: mockApiResponse,
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));
      jest
        .spyOn(cryptoRepo, 'saveConversion')
        .mockResolvedValue({} as Conversion);

      const result = await service.convertCrypto('1', dto);
      expect(result).toEqual({ valueBRL: 200, valueUSD: 100 });
      expect(cryptoRepo.saveConversion).toHaveBeenCalledWith(
        '1',
        'bitcoin',
        2,
        200,
        100,
      );
    });

    it('should throw CryptoNotFoundException if the crypto is not found', async () => {
      const dto: ConvertCryptoDto = { crypto: 'nonexistentcrypto', amount: 2 };
      const axiosResponse: AxiosResponse = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      await expect(service.convertCrypto('1', dto)).rejects.toThrow(
        CryptoNotFoundException,
      );
    });
  });

  describe('addFavorite', () => {
    it('should add a crypto to favorites', async () => {
      const dto: FavoriteCryptoDto = { crypto: 'bitcoin' };
      const mockFavorite: Favorite = {
        id: 'fav1',
        crypto: 'bitcoin',
        userId: '1',
        createdAt: new Date(),
      };

      jest.spyOn(cryptoRepo, 'findFavorite').mockResolvedValue(null);
      jest.spyOn(cryptoRepo, 'addFavorite').mockResolvedValue(mockFavorite);

      const result = await service.addFavorite('1', dto);
      expect(result).toEqual(mockFavorite);
    });

    it('should throw FavoriteAlreadyExistsException if the crypto is already a favorite', async () => {
      const dto: FavoriteCryptoDto = { crypto: 'bitcoin' };
      jest.spyOn(cryptoRepo, 'findFavorite').mockResolvedValue({} as Favorite);

      await expect(service.addFavorite('1', dto)).rejects.toThrow(
        FavoriteAlreadyExistsException,
      );
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite and return the count of removed items', async () => {
      const dto: FavoriteCryptoDto = { crypto: 'bitcoin' };
      jest.spyOn(cryptoRepo, 'removeFavorite').mockResolvedValue({ count: 1 });

      const result = await service.removeFavorite('1', dto);
      expect(result).toEqual({ count: 1 });
    });
  });

  describe('getHistory', () => {
    it("should return the user's conversion history", async () => {
      const mockHistory: Conversion[] = [
        {
          id: 'conv1',
          crypto: 'bitcoin',
          amount: 2,
          valueBRL: 200,
          valueUSD: 100,
          userId: '1',
          createdAt: new Date(),
        },
      ];

      jest.spyOn(cryptoRepo, 'getHistory').mockResolvedValue(mockHistory);

      const result = await service.getHistory('1');
      expect(result).toEqual(mockHistory);
    });
  });

  describe('getFavorites', () => {
    it("should return the user's favorite cryptocurrencies", async () => {
      const mockFavorites: Favorite[] = [
        { id: 'fav1', crypto: 'bitcoin', userId: '1', createdAt: new Date() },
      ];

      jest.spyOn(cryptoRepo, 'getFavorites').mockResolvedValue(mockFavorites);

      const result = await service.getFavorites('1');
      expect(result).toEqual(mockFavorites);
    });
  });
});
