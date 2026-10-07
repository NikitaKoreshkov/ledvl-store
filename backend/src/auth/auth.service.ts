import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin } from '../entities/admin.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const admin = await this.adminsRepository.findOne({ where: { email } });
    if (admin && await bcrypt.compare(password, admin.password_hash)) {
      const { password_hash, ...result } = admin;
      return result;
    }
    return null;
  }

  async login(admin: any) {
    const payload = { email: admin.email, sub: admin.id, role: admin.role };
    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async createAdmin(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = this.adminsRepository.create({
      email,
      password_hash: hashedPassword,
    });
    return await this.adminsRepository.save(admin);
  }
}

