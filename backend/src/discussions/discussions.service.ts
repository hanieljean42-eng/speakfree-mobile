import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class DiscussionsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getDiscussion(discussionCode: string) {
    const report = await this.prisma.report.findUnique({
      where: { discussionCode },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Discussion not found');
    }

    return {
      discussionCode: report.discussionCode,
      reportCode: report.reportCode,
      status: report.status,
      school: report.school,
      createdAt: report.createdAt,
    };
  }

  async getMessages(discussionCode: string) {
    const report = await this.prisma.report.findUnique({
      where: { discussionCode },
    });

    if (!report) {
      throw new NotFoundException('Discussion not found');
    }

    const messages = await this.prisma.message.findMany({
      where: { reportId: report.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        sender: true,
        content: true,
        isRead: true,
        createdAt: true,
      },
    });

    return messages;
  }

  async sendMessage(discussionCode: string, dto: SendMessageDto, schoolId?: string) {
    const report = await this.prisma.report.findUnique({
      where: { discussionCode },
    });

    if (!report) {
      throw new NotFoundException('Discussion not found');
    }

    // Vérifier que l'école correspond si c'est un message d'école
    if (dto.sender === 'SCHOOL') {
      if (!schoolId || report.schoolId !== schoolId) {
        throw new NotFoundException('Unauthorized');
      }
    }

    const message = await this.prisma.message.create({
      data: {
        reportId: report.id,
        schoolId: dto.sender === 'SCHOOL' ? schoolId : null,
        sender: dto.sender,
        content: dto.content,
      },
    });

    await this.auditService.log({
      actorType: dto.sender === 'STUDENT' ? 'STUDENT' : 'SCHOOL',
      actorId: schoolId,
      action: 'MESSAGE_SENT',
      resource: 'MESSAGE',
      resourceId: message.id,
      metadata: {
        discussionCode,
        reportId: report.id,
      },
    });

    return message;
  }

  async markAsRead(messageId: string) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  async getUnreadCount(discussionCode: string, forSchool: boolean) {
    const report = await this.prisma.report.findUnique({
      where: { discussionCode },
    });

    if (!report) {
      return 0;
    }

    return this.prisma.message.count({
      where: {
        reportId: report.id,
        isRead: false,
        sender: forSchool ? 'STUDENT' : 'SCHOOL',
      },
    });
  }
}
