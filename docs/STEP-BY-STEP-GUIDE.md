# 🎓 Tutorial Práctico: Cómo Replicar lo que Hicimos

> Guía paso a paso para entender y reproducir todo lo que se implementó

---

## Parte 1: Clean Architecture + Repository Pattern

### Paso 1.1: Crear la Interfaz (Contrato)

**¿Por qué?** Define qué métodos debe tener cualquier repositorio

```typescript
// src/modules/products/app/ports/product.repository.port.ts
import { Product } from "../../domain/entities/product.entity";
import { ProductVariant } from "../../domain/entities/productVariant.entity";

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  create(product: Product, variants: ProductVariant[]): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
```

### Paso 1.2: Crear las Entidades de Dominio

**¿Por qué?** Representan la lógica de negocio sin dependencias externas

```typescript
// src/modules/products/domain/entities/product.entity.ts
export class Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId: string;
  variants: ProductVariant[];
  images: ProductImage[];
  createdAt?: Date;
  updatedAt?: Date;

  // Métodos de lógica de negocio pura
  calculateDiscount(percentageOff: number): number {
    return this.price * (1 - percentageOff / 100);
  }

  isInStock(): boolean {
    return this.variants.some((v) => v.stock > 0);
  }
}

// src/modules/products/domain/entities/productVariant.entity.ts
export class ProductVariant {
  id: string;
  sku: string;
  size: string;
  stock: number;
  price?: number;
  productId: string;
}
```

### Paso 1.3: Implementar el Repositorio con Prisma

**¿Por qué?** Aquí va la lógica específica de cómo acceder a BD

```typescript
// src/modules/products/infrastructure/repositories/prisma.product.repository.ts
import { Injectable } from "@nestjs/common";
import { v4 } from "uuid";
import { PrismaService } from "../../../../common/prisma/prisma.service";
import { Product } from "../../domain/entities/product.entity";
import { ProductVariant } from "../../domain/entities/productVariant.entity";
import { IProductRepository } from "../../app/ports/product.repository.port";

@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private prisma: PrismaService) {}

  // Implementar cada método de la interfaz

  async findAll(): Promise<Product[]> {
    // 1. Consultar Prisma
    const products = await this.prisma.product.findMany({
      include: {
        variants: true,
        images: true,
      },
    });

    // 2. Convertir a entidades de dominio
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

    if (!product) return null;
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

    if (!product) return null;
    return this.toDomainEntity(product);
  }

  async create(product: Product, variants: ProductVariant[]): Promise<Product> {
    // Generar slug automáticamente
    const slug = this.generateSlug(product.name);

    const created = await this.prisma.product.create({
      data: {
        id: v4(),
        name: product.name,
        slug: slug,
        description: product.description || null,
        price: product.price,
        categoryId: product.categoryId,
        variants: {
          create: variants.map((v) => ({
            id: v4(),
            sku: v.sku,
            size: v.size,
            stock: v.stock,
          })),
        },
      },
      include: {
        variants: true,
        images: true,
      },
    });

    return this.toDomainEntity(created);
  }

  async update(product: Product): Promise<Product> {
    const updated = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
      },
      include: {
        variants: true,
        images: true,
      },
    });

    return this.toDomainEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  // Métodos privados para mapeo
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  private toDomainEntity(prismaProduct: any): Product {
    const product = new Product();
    product.id = prismaProduct.id;
    product.name = prismaProduct.name;
    product.slug = prismaProduct.slug;
    product.description = prismaProduct.description;
    product.price = prismaProduct.price;
    product.categoryId = prismaProduct.categoryId;
    product.variants =
      prismaProduct.variants?.map((v) => this.toDomainVariant(v)) || [];
    product.images = prismaProduct.images || [];
    return product;
  }

  private toDomainVariant(prismaVariant: any): ProductVariant {
    const variant = new ProductVariant();
    variant.id = prismaVariant.id;
    variant.sku = prismaVariant.sku;
    variant.size = prismaVariant.size;
    variant.stock = prismaVariant.stock;
    variant.productId = prismaVariant.productId;
    return variant;
  }
}
```

### Paso 1.4: Configurar Inyección de Dependencias

**¿Por qué?** NestJS inyecta automáticamente las dependencias

```typescript
// src/modules/products/app/ports/product.repository.token.ts
export const PRODUCT_REPOSITORY_TOKEN = "IProductRepository";

// src/modules/products/products.module.ts
import { Module } from "@nestjs/common";
import { PRODUCT_REPOSITORY_TOKEN } from "./app/ports/product.repository.token";
import { PrismaProductRepository } from "./infrastructure/repositories/prisma.product.repository";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { ProductsController } from "./infrastructure/controllers/products.controller";

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: PRODUCT_REPOSITORY_TOKEN,
      useClass: PrismaProductRepository, // Inyectar esta implementación
    },
  ],
  exports: [PRODUCT_REPOSITORY_TOKEN],
})
export class ProductsModule {}
```

---

## Parte 2: DTOs y Validación

### Paso 2.1: Crear DTOs con Validadores

**¿Por qué?** Validar datos de entrada automáticamente

```typescript
// src/modules/products/infrastructure/dtos/createProductDTO.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";

// DTO para variantes
export class CreateProductVariantDto {
  @IsString()
  sku: string;

  @IsString()
  size: string;

  @IsNumber()
  @Min(0)
  stock: number;
}

// DTO para productos
export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0.01) // Mínimo $0.01
  price: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];
}
```

### Paso 2.2: Agregar ValidationPipe Global

**¿Por qué?** Aplicar validación automáticamente a todos los requests

```typescript
// src/main.ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Agregar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Solo props del DTO
      forbidNonWhitelisted: true, // Error si hay props extra
      transform: true, // Convertir tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(4000);
}

bootstrap();
```

---

## Parte 3: Controllers y Endpoints

### Paso 3.1: Crear Controller

**¿Por qué?** Exponer endpoints HTTP

```typescript
// src/modules/products/infrastructure/controllers/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  HttpCode,
  NotFoundException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { PRODUCT_REPOSITORY_TOKEN } from "../../app/ports/product.repository.token";
import { IProductRepository } from "../../app/ports/product.repository.port";
import { CreateProductDto } from "../dtos/createProductDTO";

@Controller("products")
@ApiTags("products")
export class ProductsController {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly repository: IProductRepository,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: "Crear nuevo producto" })
  async create(@Body() createProductDto: CreateProductDto) {
    // El DTO ya está validado aquí
    return this.repository.create(
      createProductDto as any,
      createProductDto.variants || [],
    );
  }

  @Get()
  @ApiOperation({ summary: "Obtener todos los productos" })
  async findAll() {
    return this.repository.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener producto por ID" })
  async findById(@Param("id") id: string) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Obtener producto por slug" })
  async findBySlug(@Param("slug") slug: string) {
    const product = await this.repository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    return product;
  }

  @Put(":id")
  @ApiOperation({ summary: "Actualizar producto" })
  async update(@Param("id") id: string, @Body() updateProductDto: any) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.repository.update({ ...existing, ...updateProductDto });
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Eliminar producto" })
  async delete(@Param("id") id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.repository.delete(id);
  }
}
```

---

## Parte 4: Setup de Testing E2E

### Paso 4.1: Configurar Jest

```json
// backend/test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/../src/$1"
  },
  "setupFilesAfterEnv": ["<rootDir>/setup.ts"]
}
```

```typescript
// backend/test/setup.ts
import * as path from "path";
import * as dotenv from "dotenv";

const envPath = path.resolve(__dirname, "../.env.test");
dotenv.config({ path: envPath });
```

```env
# backend/.env.test
DATABASE_URL="postgresql://admin:zerofear2505@localhost:5433/zeroFear_db"
PORT=4000
NODE_ENV=test
```

### Paso 4.2: Script en package.json

```json
{
  "scripts": {
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:e2e:watch": "jest --config ./test/jest-e2e.json --watch",
    "test:e2e:coverage": "jest --config ./test/jest-e2e.json --coverage"
  }
}
```

---

## Parte 5: Escribir el Test E2E Completo

### Paso 5.1: Test File

```typescript
// backend/test/products.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/common/prisma/prisma.service";

describe("Products (e2e)", () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let productId: string;
  let productSlug: string;
  let categoryId: string;

  // ═══════════════════════════════════════════
  // SETUP: Antes de todos los tests
  // ═══════════════════════════════════════════
  beforeAll(async () => {
    // 1. Crear módulo de testing
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // 2. Inicializar app
    app = moduleFixture.createNestApplication();
    await app.init();

    // 3. Obtener servicios
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // 4. Crear categoría de prueba
    const category = await prismaService.category.create({
      data: {
        name: "Test Category",
      },
    });
    categoryId = category.id;
  });

  // ═══════════════════════════════════════════
  // TEARDOWN: Después de todos los tests
  // ═══════════════════════════════════════════
  afterAll(async () => {
    await prismaService.productVariant.deleteMany({});
    await prismaService.productImage.deleteMany({});
    await prismaService.product.deleteMany({});
    await prismaService.category.deleteMany({});
    await app.close();
  });

  // ═══════════════════════════════════════════
  // TEST SUITE 1: POST /products
  // ═══════════════════════════════════════════
  describe("POST /products (Create)", () => {
    it("should create a product with variants", async () => {
      // ARRANGE
      const createProductDto = {
        name: "Test Product",
        price: 29.99,
        categoryId: categoryId,
        variants: [
          {
            sku: "TEST-001-M",
            size: "M",
            stock: 10,
          },
        ],
      };

      // ACT
      const res = await request(app.getHttpServer())
        .post("/products")
        .send(createProductDto);

      // ASSERT
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("Test Product");
      expect(res.body.price).toBe(29.99);
      expect(res.body).toHaveProperty("slug");

      // Guardar para otros tests
      productId = res.body.id;
      productSlug = res.body.slug;
    });
  });

  // ═══════════════════════════════════════════
  // TEST SUITE 2: GET /products
  // ═══════════════════════════════════════════
  describe("GET /products (Find All)", () => {
    it("should return all products", async () => {
      const res = await request(app.getHttpServer())
        .get("/products")
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════
  // TEST SUITE 3: GET /products/:id
  // ═══════════════════════════════════════════
  describe("GET /products/:id (Find by ID)", () => {
    it("should return a product by ID", async () => {
      const res = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);

      expect(res.body.id).toBe(productId);
      expect(res.body.name).toBe("Test Product");
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = "ffffffff-ffff-ffff-ffff-ffffffffffff";

      const res = await request(app.getHttpServer())
        .get(`/products/${fakeId}`)
        .expect(404);
    });
  });

  // ═══════════════════════════════════════════
  // TEST SUITE 4: GET /products/slug/:slug
  // ═══════════════════════════════════════════
  describe("GET /products/slug/:slug (Find by Slug)", () => {
    it("should return a product by slug", async () => {
      const res = await request(app.getHttpServer())
        .get(`/products/slug/${productSlug}`)
        .expect(200);

      expect(res.body.slug).toBe(productSlug);
    });

    it("should return 404 for non-existent slug", async () => {
      const res = await request(app.getHttpServer())
        .get("/products/slug/non-existent-slug")
        .expect(404);
    });
  });
});
```

---

## Parte 6: Ejecutar Tests

### Paso 6.1: Iniciar todo

```bash
# 1. Iniciar PostgreSQL
docker-compose up -d

# 2. Ejecutar migraciones de Prisma
cd backend
pnpm prisma migrate dev

# 3. Ejecutar tests
pnpm test:e2e

# 4. Resultado esperado
# Test Suites: 1 passed, 1 total
# Tests: 6 passed, 6 total
```

### Paso 6.2: Resultados

```
PASS test/products.e2e-spec.ts
  Products (e2e)
    POST /products (Create)
      ✓ should create a product with variants (45ms)
    GET /products (Find All)
      ✓ should return all products (12ms)
    GET /products/:id (Find by ID)
      ✓ should return a product by ID (8ms)
      ✓ should return 404 for non-existent product (5ms)
    GET /products/slug/:slug (Find by Slug)
      ✓ should return a product by slug (6ms)
      ✓ should return 404 for non-existent slug (4ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Time:        2.631 s
```

---

## Puntos Clave que Aprender

### 1. Clean Architecture

```
Domain (Lógica pura)
  ↓
Application (Casos de uso)
  ↓
Infrastructure (Detalles técnicos)
```

### 2. Repository Pattern

- Define interfaz
- Implementa con BD específica
- Separa dominio de infraestructura

### 3. Inyección de Dependencias

- NestJS maneja las dependencias automáticamente
- Usar tokens para evitar conflictos
- Permite testing sin BD real

### 4. DTOs + Validación

- Define qué entra a la API
- Valida automáticamente
- Whitelist solo campos permitidos

### 5. E2E Testing

- Probar flujo HTTP completo
- Usar Supertest para assertions
- Seguir patrón AAA (Arrange-Act-Assert)
- Limpiar datos después de tests

### 6. Prisma Migrations

- Versionan cambios en BD
- Reversibles si es necesario
- Sincronizar esquema con código
