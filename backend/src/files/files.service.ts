import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as AWS from 'aws-sdk';
import { nanoid } from 'nanoid';

@Injectable()
export class FilesService {
  private s3: AWS.S3;
  private bucket: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
    this.bucket = this.configService.get('AWS_S3_BUCKET') || 'speakfree-files';
  }

  async uploadFile(
    file: Express.Multer.File,
    reportId: string,
  ): Promise<any> {
    // Valider le fichier
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG and PNG images are allowed');
    }

    // Vérifier que le report existe
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Générer un nom de fichier unique
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${reportId}/${nanoid()}.${fileExtension}`;

    try {
      // Upload vers S3
      const uploadResult = await this.s3
        .upload({
          Bucket: this.bucket,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'private',
        })
        .promise();

      // Enregistrer dans la base de données
      const fileRecord = await this.prisma.file.create({
        data: {
          reportId,
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: uploadResult.Location,
        },
      });

      return fileRecord;
    } catch (error) {
      throw new BadRequestException('Failed to upload file');
    }
  }

  async getFile(fileId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async getFileUrl(fileId: string): Promise<string> {
    const file = await this.getFile(fileId);

    // Générer une URL signée valide 1 heure
    const params = {
      Bucket: this.bucket,
      Key: file.url.split('/').slice(-2).join('/'), // Extraire la clé S3
      Expires: 3600, // 1 heure
    };

    try {
      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;
    } catch (error) {
      throw new BadRequestException('Failed to generate download URL');
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    const file = await this.getFile(fileId);

    const key = file.url.split('/').slice(-2).join('/');

    try {
      // Supprimer de S3
      await this.s3
        .deleteObject({
          Bucket: this.bucket,
          Key: key,
        })
        .promise();

      // Supprimer de la base de données
      await this.prisma.file.delete({
        where: { id: fileId },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete file');
    }
  }

  async getReportFiles(reportId: string) {
    return this.prisma.file.findMany({
      where: { reportId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
