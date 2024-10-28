import { HttpException, HttpStatus } from '@nestjs/common';

export class CryptoNotFoundException extends HttpException {
  constructor(cryptoId: string) {
    super(`Crypto ${cryptoId} not found`, HttpStatus.NOT_FOUND);
  }
}
