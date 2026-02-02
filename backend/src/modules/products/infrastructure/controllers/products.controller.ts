import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import type { IProductRepository } from '../../app/ports/product.repository.port';
import { PRODUCT_REPOSITORY_TOKEN } from '../../app/ports/product.repository.token';
import { Product } from '../../domain/entities/product.entity';
import { ProductVariant } from '../../domain/entities/productVariant.entity';
import { ProductImage } from '../../domain/entities/productImage.entity';
import { CreateProductDto } from '../dtos/createProductDTO';
import { randomUUID } from 'crypto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'Return all products with variants and images',
    type: [Product],
  })
  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findById(@Param('id') id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiParam({ name: 'slug', type: 'string', description: 'Product slug' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findBySlug(@Param('slug') slug: string): Promise<Product> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    return product;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    const productId = randomUUID();
    
    // Create variants from DTO
    const variants = (createProductDto.variants || []).map((v) =>
      new ProductVariant(
        randomUUID(),
        v.sku,
        v.size,
        v.stock || 0,
        v.price,
        v.purchasePrice,
      ),
    );

    // Create product entity
    const product = new Product(
      productId,
      createProductDto.name,
      this.generateSlug(createProductDto.name),
      createProductDto.description || null,
      createProductDto.price,
      createProductDto.purchasePrice || null,
      createProductDto.imageUrl || null,
      createProductDto.categoryId,
      [], // images
      variants,
    );

    return this.productRepository.create(product, variants);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<CreateProductDto>,
  ): Promise<Product> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updatedProduct = new Product(
      id,
      updateProductDto.name || existingProduct.name,
      this.generateSlug(updateProductDto.name || existingProduct.name),
      updateProductDto.description !== undefined
        ? updateProductDto.description
        : existingProduct.description,
      updateProductDto.price || existingProduct.price,
      updateProductDto.purchasePrice !== undefined
        ? updateProductDto.purchasePrice
        : existingProduct.purchasePrice,
      updateProductDto.imageUrl !== undefined
        ? updateProductDto.imageUrl
        : existingProduct.imageUrl,
      updateProductDto.categoryId || existingProduct.categoryId,
      existingProduct.images,
      existingProduct.variants,
    );

    return this.productRepository.update(updatedProduct);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiResponse({
    status: 204,
    description: 'Product deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async delete(@Param('id') id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.productRepository.delete(id);
  }

  /**
   * Helper: Generate slug from product name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-');
  }
}
