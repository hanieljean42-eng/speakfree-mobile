import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload/:reportId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('reportId') reportId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.filesService.uploadFile(file, reportId);
  }

  @Get(':fileId')
  async getFile(@Param('fileId') fileId: string) {
    return this.filesService.getFile(fileId);
  }

  @Get(':fileId/url')
  async getFileUrl(@Param('fileId') fileId: string) {
    const url = await this.filesService.getFileUrl(fileId);
    return { url };
  }

  @Get('report/:reportId')
  async getReportFiles(@Param('reportId') reportId: string) {
    return this.filesService.getReportFiles(reportId);
  }

  @Delete(':fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    await this.filesService.deleteFile(fileId);
    return { message: 'File deleted successfully' };
  }
}
