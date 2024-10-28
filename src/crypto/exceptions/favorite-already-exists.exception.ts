import { HttpException, HttpStatus } from '@nestjs/common';

export class FavoriteAlreadyExistsException extends HttpException {
  constructor(cryptoId: string) {
    super(`Crypto ${cryptoId} is already in favorites`, HttpStatus.CONFLICT);
  }
}
