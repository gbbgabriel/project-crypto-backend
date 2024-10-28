import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';

@Injectable()
export class ErrorHandlerService {
  constructor(private readonly rateLimiter: RateLimiterService) {}

  handleApiError(error: any) {
    const errorCode = error.response?.status;
    if ([429, 503].includes(errorCode)) {
      this.rateLimiter.activateBlock();
      throw new HttpException(
        'Exceeded API rate limit or service unavailable. Blocking requests temporarily.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    throw error;
  }
}
