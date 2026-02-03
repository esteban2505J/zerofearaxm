import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Express } from 'express';
import { UploadService } from '../services/upload.service';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir una imagen' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagen (JPG, PNG, WebP, etc)',
        },
      },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.uploadService.uploadImage(file);
    return {
      success: true,
      imageUrl,
      message: 'Imagen subida exitosamente',
    };
  }

  @Post('images')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 10)) // Máximo 10 archivos
  @ApiOperation({ summary: 'Subir múltiples imágenes' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Array de imágenes (máx 10)',
        },
      },
    },
  })
  async uploadMultipleImages(@UploadedFiles() files: Express.Multer.File[]) {
    const imageUrls = await this.uploadService.uploadMultipleImages(files);
    return {
      success: true,
      imageUrls,
      count: imageUrls.length,
      message: 'Imágenes subidas exitosamente',
    };
  }
}
