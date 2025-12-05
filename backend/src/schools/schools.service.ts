import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpdateSchoolStatusDto } from './dto/update-school-status.dto';

@Injectable()
export class SchoolsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.school.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        type: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            reports: true,
          },
        },
      },
    });
  }

  async findPending() {
    return this.findAll('PENDING');
  }

  async findOne(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        type: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            reports: true,
          },
        },
      },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    return school;
  }

  async updateStatus(
    id: string,
    dto: UpdateSchoolStatusDto,
    actorId: string,
  ) {
    const school = await this.prisma.school.findUnique({
      where: { id },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    if (school.status === dto.status) {
      throw new ForbiddenException('School already has this status');
    }

    const updated = await this.prisma.school.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.rejectionReason,
      },
    });

    await this.auditService.log({
      actorType: 'SUPER_ADMIN',
      actorId,
      action: 'SCHOOL_STATUS_UPDATED',
      resource: 'SCHOOL',
      resourceId: id,
      metadata: {
        oldStatus: school.status,
        newStatus: dto.status,
        rejectionReason: dto.rejectionReason,
      },
    });

    return updated;
  }

  async getSchoolStats(schoolId: string) {
    const school = await this.findOne(schoolId);

    const [
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      reportsByType,
    ] = await Promise.all([
      this.prisma.report.count({
        where: { schoolId },
      }),
      this.prisma.report.count({
        where: { schoolId, status: 'PENDING' },
      }),
      this.prisma.report.count({
        where: { schoolId, status: 'IN_PROGRESS' },
      }),
      this.prisma.report.count({
        where: { schoolId, status: 'RESOLVED' },
      }),
      this.prisma.report.groupBy({
        by: ['type'],
        where: { schoolId },
        _count: true,
      }),
    ]);

    return {
      school: {
        id: school.id,
        name: school.name,
        status: school.status,
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
        inProgress: inProgressReports,
        resolved: resolvedReports,
        byType: reportsByType.map((r) => ({
          type: r.type,
          count: r._count,
        })),
      },
    };
  }
}
