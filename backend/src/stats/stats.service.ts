import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getSuperAdminStats() {
    const [
      totalSchools,
      activeSchools,
      pendingSchools,
      inactiveSchools,
      totalReports,
      reportsToday,
      reportsThisWeek,
      reportsThisMonth,
      reportsByStatus,
      reportsByType,
      recentReports,
    ] = await Promise.all([
      this.prisma.school.count(),
      this.prisma.school.count({ where: { status: 'ACTIVE' } }),
      this.prisma.school.count({ where: { status: 'PENDING' } }),
      this.prisma.school.count({ where: { status: 'INACTIVE' } }),
      this.prisma.report.count(),
      this.prisma.report.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.report.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.report.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.report.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.report.groupBy({
        by: ['type'],
        _count: true,
      }),
      this.prisma.report.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          school: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Calculer le temps moyen de résolution
    const resolvedReports = await this.prisma.report.findMany({
      where: {
        status: 'RESOLVED',
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    let avgResolutionTime = 0;
    if (resolvedReports.length > 0) {
      const totalTime = resolvedReports.reduce((sum, report) => {
        const diff =
          report.resolvedAt!.getTime() - report.createdAt.getTime();
        return sum + diff;
      }, 0);
      avgResolutionTime = totalTime / resolvedReports.length / (1000 * 60 * 60); // en heures
    }

    return {
      schools: {
        total: totalSchools,
        active: activeSchools,
        pending: pendingSchools,
        inactive: inactiveSchools,
      },
      reports: {
        total: totalReports,
        today: reportsToday,
        thisWeek: reportsThisWeek,
        thisMonth: reportsThisMonth,
        byStatus: reportsByStatus.map((r) => ({
          status: r.status,
          count: r._count,
        })),
        byType: reportsByType.map((r) => ({
          type: r.type,
          count: r._count,
        })),
        avgResolutionTimeHours: Math.round(avgResolutionTime),
      },
      recentReports: recentReports.map((r) => ({
        id: r.id,
        reportCode: r.reportCode,
        type: r.type,
        status: r.status,
        schoolName: r.school.name,
        createdAt: r.createdAt,
      })),
    };
  }

  async getSchoolStats(schoolId: string) {
    const [
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      closedReports,
      reportsToday,
      reportsThisWeek,
      reportsThisMonth,
      reportsByType,
      recentReports,
    ] = await Promise.all([
      this.prisma.report.count({ where: { schoolId } }),
      this.prisma.report.count({
        where: { schoolId, status: 'PENDING' },
      }),
      this.prisma.report.count({
        where: { schoolId, status: 'IN_PROGRESS' },
      }),
      this.prisma.report.count({
        where: { schoolId, status: 'RESOLVED' },
      }),
      this.prisma.report.count({
        where: { schoolId, status: 'CLOSED' },
      }),
      this.prisma.report.count({
        where: {
          schoolId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.report.count({
        where: {
          schoolId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.report.count({
        where: {
          schoolId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.report.groupBy({
        by: ['type'],
        where: { schoolId },
        _count: true,
      }),
      this.prisma.report.findMany({
        where: { schoolId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reportCode: true,
          type: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculer le temps moyen de réponse (première réponse de l'école)
    const reportsWithMessages = await this.prisma.report.findMany({
      where: {
        schoolId,
        messages: {
          some: {
            sender: 'SCHOOL',
          },
        },
      },
      include: {
        messages: {
          where: { sender: 'SCHOOL' },
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    let avgResponseTime = 0;
    if (reportsWithMessages.length > 0) {
      const totalTime = reportsWithMessages.reduce((sum, report) => {
        if (report.messages[0]) {
          const diff =
            report.messages[0].createdAt.getTime() -
            report.createdAt.getTime();
          return sum + diff;
        }
        return sum;
      }, 0);
      avgResponseTime = totalTime / reportsWithMessages.length / (1000 * 60 * 60); // en heures
    }

    return {
      reports: {
        total: totalReports,
        pending: pendingReports,
        inProgress: inProgressReports,
        resolved: resolvedReports,
        closed: closedReports,
        today: reportsToday,
        thisWeek: reportsThisWeek,
        thisMonth: reportsThisMonth,
        byType: reportsByType.map((r) => ({
          type: r.type,
          count: r._count,
        })),
        avgResponseTimeHours: Math.round(avgResponseTime),
      },
      recentReports,
    };
  }
}
