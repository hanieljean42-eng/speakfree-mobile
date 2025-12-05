import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Ip,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginSuperAdminDto, LoginSchoolDto, RegisterSchoolDto, RefreshTokenDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('superadmin/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async superAdminLogin(@Body() dto: LoginSuperAdminDto, @Ip() ip: string) {
    return this.authService.superAdminLogin(dto.email, dto.code, ip);
  }

  @Post('school/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async schoolLogin(@Body() dto: LoginSchoolDto, @Ip() ip: string) {
    return this.authService.schoolLogin(dto.email, dto.password, ip);
  }

  @Post('school/register')
  @HttpCode(HttpStatus.CREATED)
  async registerSchool(@Body() dto: RegisterSchoolDto) {
    return this.authService.registerSchool(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
