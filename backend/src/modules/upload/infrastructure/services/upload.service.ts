import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import type { Express } from 'express';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Subir imagen a Cloudinary
   * @param file - Buffer del archivo
   * @param fileName - Nombre del archivo
   * @returns URL pública de la imagen
   */
  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      // Validar que sea imagen
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('El archivo debe ser una imagen');
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('La imagen no puede superar 5MB');
      }

      // Crear stream desde buffer
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'zeroFear/products', // Organizar en carpeta
          },
          (error, result) => {
            if (error) {
              reject(new BadRequestException('Error al subir imagen a Cloudinary'));
            } else if (result) {
              resolve(result.secure_url); // URL HTTPS segura
            }
          }
        );

        // Enviar buffer al stream
        stream.end(file.buffer);
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al procesar la imagen');
    }
  }

  /**
   * Subir múltiples imágenes
   * @param files - Array de archivos
   * @returns Array de URLs públicas
   */
  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Debes proporcionar al menos una imagen');
    }

    if (files.length > 10) {
      throw new BadRequestException('No puedes subir más de 10 imágenes a la vez');
    }

    const urls = await Promise.all(
      files.map((file) => this.uploadImage(file))
    );

    return urls;
  }

  /**
   * Eliminar imagen de Cloudinary
   * @param publicId - ID público de la imagen en Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new BadRequestException('Error al eliminar imagen');
    }
  }
}
