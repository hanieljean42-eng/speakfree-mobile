import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateReportDto) {
    return this.reportsService.create(dto);
  }

  @Get('track/:code')
  async trackByCode(@Param('code') code: string) {
    return this.reportsService.findByCode(code);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  async getAllReports(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('schoolId') schoolId?: string,
  ) {
    return this.reportsService.getAllReports({ status, type, schoolId });
  }

  @Get('school/:schoolId')
  @UseGuards(JwtAuthGuard)
  async findBySchool(
    @Param('schoolId') schoolId: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.reportsService.findBySchool(schoolId, { status, type });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReportStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.updateStatus(id, dto, user.userId);
  }
}
