import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('cart')
@Controller('api/v1/cart')
export class CartController {
  @Get()
  @ApiOperation({ summary: 'Get cart (client-side storage)' })
  getCart() {
    return { message: 'Cart is stored client-side' };
  }

  @Post()
  @ApiOperation({ summary: 'Update cart (client-side storage)' })
  updateCart(@Body() data: any) {
    return { message: 'Cart updated', data };
  }
}

