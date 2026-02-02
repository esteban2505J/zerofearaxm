import { Module } from '@nestjs/common';
import { ProductsController } from './infrastructure/controllers/products.controller';
import { PrismaProductRepository } from './infrastructure/repositories/prisma.product.repository';
import { PRODUCT_REPOSITORY_TOKEN } from './app/ports/product.repository.token';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY_TOKEN,
      useClass: PrismaProductRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY_TOKEN],
})
export class ProductsModule {}
