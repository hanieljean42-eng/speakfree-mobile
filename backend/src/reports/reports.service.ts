import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateReportDto) {
    // Vérifier que l'école existe et est active
    const school = await this.prisma.school.findUnique({
      where: { id: dto.schoolId },
    });

    if (!school) {
      throw new NotFoundException('School not found');
    }

    if (school.status !== 'ACTIVE') {
      throw new BadRequestException('School is not active');
    }

    // Générer les codes uniques
    const reportCode = `RPT-${nanoid(5).toUpperCase()}`;
    const discussionCode = `DSC-${nanoid(5).toUpperCase()}`;

    // Créer le signalement
    const report = await this.prisma.report.create({
      data: {
        schoolId: dto.schoolId,
        reportCode,
        discussionCode,
        type: dto.type,
        incidentDate: dto.incidentDate ? new Date(dto.incidentDate) : null,
        place: dto.place,
        description: dto.description,
        witnesses: dto.witnesses,
        status: 'PENDING',
      },
    });

    // Log d'audit
    await this.auditService.log({
      actorType: 'STUDENT',
      action: 'REPORT_CREATED',
      resource: 'REPORT',
      resourceId: report.id,
      metadata: {
        schoolId: dto.schoolId,
        type: dto.type,
        reportCode,
      },
    });

    // Envoyer notification à l'école
    await this.notificationsService.notifyNewReport(school.id, report.id);

    return {
      id: report.id,
      reportCode,
      discussionCode,
      message: 'Report created successfully. Save your codes to track your report.',
    };
  }

  async findByCode(code: string) {
    const report = await this.prisma.report.findUnique({
      where: { reportCode: code },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return {
      id: report.id,
      reportCode: report.reportCode,
      discussionCode: report.discussionCode,
      type: report.type,
      incidentDate: report.incidentDate,
      place: report.place,
      description: report.description,
      witnesses: report.witnesses,
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      school: {
        name: report.school.name,
      },
    };
  }

  async findBySchool(schoolId: string, filters?: {
    status?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = { schoolId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    return this.prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reportCode: true,
        discussionCode: true,
        type: true,
        incidentDate: true,
        place: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            sender: true,
            content: true,
            isRead: true,
            createdAt: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async updateStatus(
    id: string,
    dto: UpdateReportStatusDto,
    schoolId: string,
  ) {
    const report = await this.prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.schoolId !== schoolId) {
      throw new BadRequestException('Unauthorized');
    }

    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        status: dto.status,
        resolvedAt: dto.status === 'RESOLVED' ? new Date() : null,
      },
    });

    await this.auditService.log({
      actorType: 'SCHOOL',
      actorId: schoolId,
      action: 'REPORT_STATUS_UPDATED',
      resource: 'REPORT',
      resourceId: id,
      metadata: {
        oldStatus: report.status,
        newStatus: dto.status,
      },
    });

    // Notification de changement de statut
    await this.notificationsService.notifyStatusChange(
      report.discussionCode,
      dto.status,
    );

    return updated;
  }

  async getAllReports(filters?: {
    status?: string;
    type?: string;
    schoolId?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.schoolId) {
      where.schoolId = filters.schoolId;
    }

    return this.prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
