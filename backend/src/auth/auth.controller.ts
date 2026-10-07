import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register first admin (only works if no admins exist)' })
  async register(@Body() body: { email: string; password: string }) {
    const adminCount = await this.adminsRepository.count();
    if (adminCount > 0) {
      throw new BadRequestException('Admin registration is only allowed when no admins exist');
    }
    const admin = await this.authService.createAdmin(body.email, body.password);
    return {
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}

