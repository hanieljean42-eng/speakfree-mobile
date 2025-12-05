import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('superadmin')
  @UseGuards(SuperAdminGuard)
  async getSuperAdminStats() {
    return this.statsService.getSuperAdminStats();
  }

  @Get('schools/:schoolId')
  async getSchoolStats(@Param('schoolId') schoolId: string) {
    return this.statsService.getSchoolStats(schoolId);
  }
}
