import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FiltersService } from './filters.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('filters')
@Controller('api/v1/filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all filters' })
  async findAll(@Query('category') category?: string) {
    return this.filtersService.findAll(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get filter by ID' })
  async findOne(@Param('id') id: string) {
    return this.filtersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create filter (admin only)' })
  async create(@Body() data: any) {
    return this.filtersService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update filter (admin only)' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.filtersService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete filter (admin only)' })
  async delete(@Param('id') id: string) {
    return this.filtersService.delete(id);
  }

  @Post(':id/values')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create filter value (admin only)' })
  async createValue(@Param('id') id: string, @Body() data: any) {
    return this.filtersService.createValue(id, data);
  }

  @Put('values/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update filter value (admin only)' })
  async updateValue(@Param('id') id: string, @Body() data: any) {
    return this.filtersService.updateValue(id, data);
  }

  @Delete('values/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete filter value (admin only)' })
  async deleteValue(@Param('id') id: string) {
    return this.filtersService.deleteValue(id);
  }
}

