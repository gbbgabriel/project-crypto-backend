import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class RateLimiterService {
  private isBlocked = false;
  private unblockTime: Date | null = null;
  private readonly BLOCK_DURATION_MS = 60 * 1000; // 1 minuto

  shouldBlockRequests(): boolean {
    return this.isBlocked && this.unblockTime && new Date() < this.unblockTime;
  }

  activateBlock() {
    this.isBlocked = true;
    this.unblockTime = new Date(Date.now() + this.BLOCK_DURATION_MS);
    setTimeout(() => {
      this.isBlocked = false;
      this.unblockTime = null;
    }, this.BLOCK_DURATION_MS);
  }

  throwIfBlocked() {
    if (this.shouldBlockRequests()) {
      throw new HttpException(
        'Requests to CoinGecko are temporarily blocked due to rate limits. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
