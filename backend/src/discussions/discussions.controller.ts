import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('discussions')
export class DiscussionsController {
  constructor(private discussionsService: DiscussionsService) {}

  @Get(':code')
  async getDiscussion(@Param('code') code: string) {
    return this.discussionsService.getDiscussion(code);
  }

  @Get(':code/messages')
  async getMessages(@Param('code') code: string) {
    return this.discussionsService.getMessages(code);
  }

  @Post(':code/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Param('code') code: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.discussionsService.sendMessage(code, dto);
  }

  @Post(':code/messages/school')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async sendSchoolMessage(
    @Param('code') code: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.discussionsService.sendMessage(code, dto, user.userId);
  }

  @Get(':code/unread')
  async getUnreadCount(
    @Param('code') code: string,
    @Param('forSchool') forSchool: boolean = false,
  ) {
    return this.discussionsService.getUnreadCount(code, forSchool);
  }
}
