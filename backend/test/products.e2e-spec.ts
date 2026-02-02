import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/common/prisma/prisma.service';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let productId: string;
  let productSlug: string;
  let categoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Create test category
    const category = await prismaService.category.create({
      data: {
        name: 'Test Category',
      },
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    // Cleanup
    await prismaService.productVariant.deleteMany({});
    await prismaService.productImage.deleteMany({});
    await prismaService.product.deleteMany({});
    await prismaService.category.deleteMany({});
    await app.close();
  });

  describe('POST /products (Create)', () => {
    it('should create a product with variants', async () => {
      const createProductDto = {
        name: 'Test Product',
        price: 29.99,
        categoryId: categoryId,
        variants: [
          {
            sku: 'TEST-001-M',
            size: 'M',
            stock: 10,
          },
        ],
      };

      const res = await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto);

      if (res.status !== 201) {
        console.error('Response body:', res.body);
      }

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Test Product');
      productId = res.body.id;
      productSlug = res.body.slug;
    });
  });

  describe('GET /products (Find All)', () => {
    it('should return all products', async () => {
      const res = await request(app.getHttpServer()).get('/products');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /products/:id (Find by ID)', () => {
    it('should return a product by ID', async () => {
      const res = await request(app.getHttpServer()).get(`/products/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(productId);
    });
  });

  describe('GET /products/slug/:slug (Find by Slug)', () => {
    it('should return a product by slug', async () => {
      const res = await request(app.getHttpServer()).get(`/products/slug/${productSlug}`);

      expect(res.status).toBe(200);
      expect(res.body.slug).toBe(productSlug);
    });
  });

  describe('404 Scenarios', () => {
    it('should return 404 for non-existent product by ID', async () => {
      const res = await request(app.getHttpServer()).get('/products/non-existent-id');

      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent product by slug', async () => {
      const res = await request(app.getHttpServer()).get('/products/slug/non-existent-slug');

      expect(res.status).toBe(404);
    });
  });
});
