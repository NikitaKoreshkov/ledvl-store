import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('admin')
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard data' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('import-logs')
  @ApiOperation({ summary: 'Get import logs' })
  async getImportLogs() {
    return this.adminService.getImportLogs();
  }
}

