import { Module } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { DiscussionsController } from './discussions.controller';
import { DiscussionsGateway } from './discussions.gateway';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [DiscussionsController],
  providers: [DiscussionsService, DiscussionsGateway],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
