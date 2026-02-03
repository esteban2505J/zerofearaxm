import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { Category } from '../../domain/entities/category.entity';
import { ICategoryRepository } from '../../app/ports/category.repository.port';

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany();
    return categories.map((c) => this.toDomainEntity(c));
  }

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) return null;
    return this.toDomainEntity(category);
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { name },
    });
    if (!category) return null;
    return this.toDomainEntity(category);
  }

  async create(category: Category): Promise<Category> {
    const created = await this.prisma.category.create({
      data: {
        id: randomUUID(),
        name: category.name,
      },
    });

    return this.toDomainEntity(created);
  }

  async update(category: Category): Promise<Category> {
    const updated = await this.prisma.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
      },
    });

    return this.toDomainEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  private toDomainEntity(prismaCategory: any): Category {
    return new Category(
      prismaCategory.id,
      prismaCategory.name,
      prismaCategory.createdAt,
      prismaCategory.updatedAt,
    );
  }
}
