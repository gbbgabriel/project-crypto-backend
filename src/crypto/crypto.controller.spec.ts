// src/crypto/crypto.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConvertCryptoDto, FavoriteCryptoDto } from './dto/crypto.dto';
import { ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

describe('CryptoController', () => {
  let controller: CryptoController;
  let service: CryptoService;

  const mockCryptoService = {
    getCryptoList: jest.fn(),
    convertCrypto: jest.fn(),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    getHistory: jest.fn(),
    getFavorites: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: '1' }; // Simula um usuário autenticado com id '1'
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CryptoController],
      providers: [
        { provide: CryptoService, useValue: mockCryptoService },
      ],
    })
        .overrideGuard(JwtAuthGuard)
        .useValue(mockJwtAuthGuard)
        .compile();

    controller = module.get<CryptoController>(CryptoController);
    service = module.get<CryptoService>(CryptoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCryptoList', () => {
    it('should return a list of cryptocurrencies', async () => {
      const mockCryptoList = [{ id: 'bitcoin', name: 'Bitcoin' }];
      mockCryptoService.getCryptoList.mockResolvedValue(mockCryptoList);

      const result = await controller.getCryptoList();
      expect(result).toEqual(mockCryptoList);
      expect(service.getCryptoList).toHaveBeenCalled();
    });
  });

  describe('convert', () => {
    it('should convert crypto for a user', async () => {
      const dto: ConvertCryptoDto = { crypto: 'bitcoin', amount: 2 };
      const mockConversionResult = { valueBRL: 200, valueUSD: 100 };
      mockCryptoService.convertCrypto.mockResolvedValue(mockConversionResult);

      const user: JwtPayload = { id: '1', email: 'test@example.com' };
      const result = await controller.convert(dto, user);
      expect(result).toEqual(mockConversionResult);
      expect(service.convertCrypto).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('addFavorite', () => {
    it('should add a favorite crypto for a user', async () => {
      const dto: FavoriteCryptoDto = { crypto: 'bitcoin' };
      const mockFavoriteResult = { id: '1', crypto: 'bitcoin', userId: '1', createdAt: new Date() };
      mockCryptoService.addFavorite.mockResolvedValue(mockFavoriteResult);

      const user: JwtPayload = { id: '1', email: 'test@example.com' };
      const result = await controller.addFavorite(dto, user);
      expect(result).toEqual(mockFavoriteResult);
      expect(service.addFavorite).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite crypto for a user', async () => {
      const dto: FavoriteCryptoDto = { crypto: 'bitcoin' };
      const mockRemoveResult = { count: 1 };
      mockCryptoService.removeFavorite.mockResolvedValue(mockRemoveResult);

      const user: JwtPayload = { id: '1', email: 'test@example.com' };
      const result = await controller.removeFavorite(dto, user);
      expect(result).toEqual(mockRemoveResult);
      expect(service.removeFavorite).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('getHistory', () => {
    it('should return the conversion history for a user', async () => {
      const mockHistory = [{ id: '1', crypto: 'bitcoin', amount: 2, valueBRL: 200, valueUSD: 100, createdAt: new Date() }];
      mockCryptoService.getHistory.mockResolvedValue(mockHistory);

      const user: JwtPayload = { id: '1', email: 'test@example.com' };
      const result = await controller.getHistory(user);
      expect(result).toEqual(mockHistory);
      expect(service.getHistory).toHaveBeenCalledWith('1');
    });
  });

  describe('getFavorites', () => {
    it('should return the favorite cryptos for a user', async () => {
      const mockFavorites = [{ id: '1', crypto: 'bitcoin', userId: '1', createdAt: new Date() }];
      mockCryptoService.getFavorites.mockResolvedValue(mockFavorites);

      const user: JwtPayload = { id: '1', email: 'test@example.com' };
      const result = await controller.getFavorites(user);
      expect(result).toEqual(mockFavorites);
      expect(service.getFavorites).toHaveBeenCalledWith('1');
    });
  });
});
