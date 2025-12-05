import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  // Super Admin Login with code
  async superAdminLogin(email: string, code: string, ip?: string) {
    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { email },
    });

    if (!superAdmin || !superAdmin.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (superAdmin.code !== code) {
      await this.auditService.log({
        actorType: 'SUPER_ADMIN',
        actorId: superAdmin.id,
        action: 'LOGIN_FAILED',
        resource: 'AUTH',
        metadata: { reason: 'Invalid code' },
        ipAddress: ip,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: superAdmin.id,
      email: superAdmin.email,
      type: 'super_admin',
    };

    const tokens = await this.generateTokens(payload);

    await this.auditService.log({
      actorType: 'SUPER_ADMIN',
      actorId: superAdmin.id,
      action: 'LOGIN_SUCCESS',
      resource: 'AUTH',
      ipAddress: ip,
    });

    return {
      user: {
        id: superAdmin.id,
        email: superAdmin.email,
        type: 'super_admin',
      },
      ...tokens,
    };
  }

  // School Login with email/password
  async schoolLogin(email: string, password: string, ip?: string) {
    const school = await this.prisma.school.findUnique({
      where: { email },
    });

    if (!school) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (school.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        school.status === 'PENDING'
          ? 'Your account is pending approval'
          : 'Your account is inactive',
      );
    }

    const isPasswordValid = await argon2.verify(school.passwordHash, password);

    if (!isPasswordValid) {
      await this.auditService.log({
        actorType: 'SCHOOL',
        actorId: school.id,
        action: 'LOGIN_FAILED',
        resource: 'AUTH',
        metadata: { reason: 'Invalid password' },
        ipAddress: ip,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: school.id,
      email: school.email,
      type: 'school',
      schoolId: school.id,
    };

    const tokens = await this.generateTokens(payload);

    await this.auditService.log({
      actorType: 'SCHOOL',
      actorId: school.id,
      action: 'LOGIN_SUCCESS',
      resource: 'AUTH',
      ipAddress: ip,
    });

    return {
      user: {
        id: school.id,
        email: school.email,
        name: school.name,
        type: 'school',
      },
      ...tokens,
    };
  }

  // Register new school
  async registerSchool(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    type: string;
    password: string;
  }) {
    // Check if school already exists
    const existing = await this.prisma.school.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new UnauthorizedException('School already registered');
    }

    // Hash password
    const passwordHash = await argon2.hash(data.password);

    // Create school
    const school = await this.prisma.school.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        type: data.type as any,
        passwordHash,
        status: 'PENDING',
      },
    });

    await this.auditService.log({
      actorType: 'SCHOOL',
      actorId: school.id,
      action: 'SCHOOL_REGISTERED',
      resource: 'SCHOOL',
      resourceId: school.id,
      metadata: { schoolName: school.name },
    });

    return {
      id: school.id,
      name: school.name,
      email: school.email,
      status: school.status,
      message: 'School registered successfully. Waiting for super admin approval.',
    };
  }

  // Refresh token
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        type: payload.type,
        schoolId: payload.schoolId,
      };

      return await this.generateTokens(newPayload);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Generate access + refresh tokens
  private async generateTokens(payload: any) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // Validate user from JWT
  async validateUser(userId: string, type: 'super_admin' | 'school') {
    if (type === 'super_admin') {
      const superAdmin = await this.prisma.superAdmin.findUnique({
        where: { id: userId },
      });
      return superAdmin?.isActive ? superAdmin : null;
    }

    if (type === 'school') {
      const school = await this.prisma.school.findUnique({
        where: { id: userId },
      });
      return school?.status === 'ACTIVE' ? school : null;
    }

    return null;
  }
}
