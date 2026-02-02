import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import type { IProductRepository } from '../../app/ports/product.repository.port';
import { Product } from '../../domain/entities/product.entity';
import { ProductVariant } from '../../domain/entities/productVariant.entity';
import { ProductImage } from '../../domain/entities/productImage.entity';

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      include: {
        variants: true,
        images: true,
      },
    });

    return products.map((p) => this.toDomainEntity(p));
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: true,
      },
    });

    if (!product) {
      return null;
    }

    return this.toDomainEntity(product);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
        images: true,
      },
    });

    if (!product) {
      return null;
    }

    return this.toDomainEntity(product);
  }

  async create(product: Product, variants: ProductVariant[]): Promise<Product> {
    const createdProduct = await this.prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        purchasePrice: product.purchasePrice,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        variants: {
          create: variants.map((v) => ({
            sku: v.sku,
            size: v.size as any, // Size enum from Prisma schema
            stock: v.stock,
            price: v.price ?? null,
            purchasePrice: v.purchasePrice ?? null,
          })),
        },
        images: {
          create: product.images.map((img) => ({
            url: img.url,
            altText: img.altText ?? null,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          })),
        },
      },
      include: {
        variants: true,
        images: true,
      },
    });

    return this.toDomainEntity(createdProduct);
  }

  async update(product: Product): Promise<Product> {
    const updatedProduct = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        purchasePrice: product.purchasePrice,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
      },
      include: {
        variants: true,
        images: true,
      },
    });

    return this.toDomainEntity(updatedProduct);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Maps Prisma model to domain entity
   */
  private toDomainEntity(
    prismaProduct: any,
  ): Product {
    const variants = prismaProduct.variants.map(
      (v: any) =>
        new ProductVariant(
          v.id,
          v.sku,
          v.size,
          v.stock,
          v.price ?? undefined,
          v.purchasePrice ?? undefined,
        ),
    );

    const images = prismaProduct.images.map(
      (img: any) =>
        new ProductImage(
          img.id,
          img.url,
          img.altText ?? undefined,
          img.sortOrder,
          img.isPrimary,
        ),
    );

    return new Product(
      prismaProduct.id,
      prismaProduct.name,
      prismaProduct.slug,
      prismaProduct.description,
      prismaProduct.price,
      prismaProduct.purchasePrice,
      prismaProduct.imageUrl,
      prismaProduct.categoryId,
      images,
      variants,
    );
  }
}
