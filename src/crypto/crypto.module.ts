import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { CryptoRepository } from './repositories/crypto.repository';
import { HttpModule } from '@nestjs/axios'; // Não precisa do HttpService aqui
import { PrismaModule } from '../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ErrorHandlerService } from '../common/services/error-handler.service';
import { RateLimiterService } from '../common/services/rate-limiter.service';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: 60,
      max: 100,
    }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [CryptoController],
  providers: [
    CryptoService,
    CryptoRepository,
    ErrorHandlerService,
    RateLimiterService,
  ],
})
export class CryptoModule {}
