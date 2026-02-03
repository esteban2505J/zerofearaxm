import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { CATEGORY_REPOSITORY_TOKEN } from './app/ports/category.repository.token';
import { PrismaCategoryRepository } from './infrastructure/repositories/prisma.category.repository';
import { CategoriesController } from './infrastructure/controllers/categories.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [
    {
      provide: CATEGORY_REPOSITORY_TOKEN,
      useClass: PrismaCategoryRepository,
    },
  ],
  exports: [CATEGORY_REPOSITORY_TOKEN],
})
export class CategoriesModule {}
