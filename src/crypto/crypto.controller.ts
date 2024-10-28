// src/crypto/crypto.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ConvertCryptoDto, FavoriteCryptoDto } from './dto/crypto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../decorators/user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('crypto')
@ApiBearerAuth()
@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @UseGuards(JwtAuthGuard)
  @Get('list')
  @ApiOperation({
    summary: 'List all cryptocurrencies',
    description: 'Fetches a list of all available cryptocurrencies.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cryptocurrency list retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User must be logged in',
  })
  async getCryptoList() {
    return this.cryptoService.getCryptoList();
  }

  @UseGuards(JwtAuthGuard)
  @Post('convert')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Convert cryptocurrency',
    description:
      'Converts a specified cryptocurrency to fiat currencies (BRL, USD) for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversion performed successfully',
    schema: { example: { valueBRL: 123.45, valueUSD: 65.43 } },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data provided',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User must be logged in',
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async convert(
    @Body() dto: ConvertCryptoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.cryptoService.convertCrypto(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorite')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Add cryptocurrency to favorites',
    description:
      "Adds a specified cryptocurrency to the user's list of favorites.",
  })
  @ApiResponse({ status: 201, description: 'Favorite added successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data provided',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User must be logged in',
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async addFavorite(
    @Body() dto: FavoriteCryptoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.cryptoService.addFavorite(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unfavorite')
  @ApiOperation({
    summary: 'Remove cryptocurrency from favorites',
    description:
      "Removes a specified cryptocurrency from the user's list of favorites.",
  })
  @ApiResponse({ status: 200, description: 'Favorite removed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid data provided',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User must be logged in',
  })
  async removeFavorite(
    @Body() dto: FavoriteCryptoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.cryptoService.removeFavorite(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  @ApiOperation({
    summary: 'Get user conversion history',
    description: 'Retrieves the conversion history for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversion history retrieved successfully',
    schema: {
      example: [
        {
          id: '1',
          crypto: 'bitcoin',
          amount: 0.5,
          valueBRL: 123.45,
          valueUSD: 65.43,
          createdAt: '2023-04-25T15:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User must be logged in',
  })
  async getHistory(@CurrentUser() user: JwtPayload) {
    return this.cryptoService.getHistory(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  @ApiOperation({
    summary: 'Get user favorite cryptocurrencies',
    description: "Retrieves a list of the user's favorite cryptocurrencies.",
  })
  @ApiResponse({
    status: 200,
    description: 'Favorites list retrieved successfully',
    schema: {
      example: [
        { id: '1', crypto: 'ethereum', createdAt: '2023-04-25T15:00:00.000Z' },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User must be logged in',
  })
  async getFavorites(@CurrentUser() user: JwtPayload) {
    return this.cryptoService.getFavorites(user.id);
  }
}
