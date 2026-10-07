import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('products')
@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products' })
  async findAll(@Query() query: any) {
    return this.productsService.findAll(query);
  }

  @Get('filters/options')
  @ApiOperation({ summary: 'Get filter options for category' })
  @ApiResponse({ status: 200, description: 'Filter options' })
  async getFilterOptions(@Query('category') category?: string) {
    return this.productsService.getFilterOptions(category);
  }

  @Get('articles/autocomplete')
  @ApiOperation({ summary: 'Get article autocomplete suggestions' })
  @ApiResponse({ status: 200, description: 'List of articles matching query' })
  async getArticleAutocomplete(@Query('q') query?: string, @Query('category') category?: string) {
    return this.productsService.getArticleAutocomplete(query, category);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products (max 3)' })
  @ApiResponse({ status: 200, description: 'List of featured products' })
  async getFeaturedProducts() {
    return this.productsService.getFeaturedProducts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product (admin only)' })
  async create(@Body() data: any) {
    try {
      return await this.productsService.create(data);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to create product');
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (admin only)' })
  async update(@Param('id') id: string, @Body() data: any) {
    try {
      return await this.productsService.update(id, data);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Failed to update product');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (admin only)' })
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}

