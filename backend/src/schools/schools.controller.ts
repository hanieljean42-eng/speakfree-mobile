import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateSchoolStatusDto } from './dto/update-school-status.dto';

@Controller('schools')
@UseGuards(JwtAuthGuard)
export class SchoolsController {
  constructor(private schoolsService: SchoolsService) {}

  @Get()
  @UseGuards(SuperAdminGuard)
  async findAll(@Query('status') status?: string) {
    return this.schoolsService.findAll(status);
  }

  @Get('pending')
  @UseGuards(SuperAdminGuard)
  async findPending() {
    return this.schoolsService.findPending();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(SuperAdminGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSchoolStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.schoolsService.updateStatus(id, dto, user.userId);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    return this.schoolsService.getSchoolStats(id);
  }
}
