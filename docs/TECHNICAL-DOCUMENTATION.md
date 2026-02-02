# 📚 Documentación Técnica - Backend NestJS + Prisma

## Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Patrones de Diseño](#patrones-de-diseño)
4. [Estructura de Carpetas](#estructura-de-carpetas)
5. [Implementación del Repositorio](#implementación-del-repositorio)
6. [Testing E2E con Supertest](#testing-e2e-con-supertest)
7. [Validación y DTOs](#validación-y-dtos)
8. [Database con Prisma](#database-con-prisma)
9. [Documentación con Swagger](#documentación-con-swagger)

---

## 1. Arquitectura General

### Clean Architecture + NestJS

El proyecto implementa **Clean Architecture** dividiéndose en 3 capas:

```
┌─────────────────────────────────────────┐
│     PRESENTATION (Controllers)          │  ← HTTP Requests
├─────────────────────────────────────────┤
│     APPLICATION (Use Cases)             │  ← Business Logic
├─────────────────────────────────────────┤
│     INFRASTRUCTURE (Repositories)       │  ← Data Access
└─────────────────────────────────────────┘
         │
         ↓
    Database (Prisma)
```

### Ventajas:

- **Testeable**: Cada capa se puede testear independientemente
- **Escalable**: Fácil agregar nuevos repositorios o controllers
- **Mantenible**: Cambios en la BD no afectan la lógica de negocio
- **Desacoplado**: Las capas no dependen directamente una de la otra

---

## 2. Stack Tecnológico

| Componente            | Versión   | Propósito                              |
| --------------------- | --------- | -------------------------------------- |
| **NestJS**            | 11.0.1    | Framework backend con DI y decoradores |
| **TypeScript**        | 5.9.3     | Type safety en tiempo de desarrollo    |
| **Prisma**            | 7.3.0     | ORM con migraciones automáticas        |
| **PostgreSQL**        | 15 Alpine | Base de datos relacional               |
| **Jest**              | 30.0.0    | Testing framework                      |
| **Supertest**         | 7.2.2     | HTTP assertions para E2E tests         |
| **class-validator**   | 0.14.3    | Validación de DTOs con decoradores     |
| **class-transformer** | 0.5.1     | Transformación de payloads             |
| **@nestjs/swagger**   | 11.2.5    | Documentación OpenAPI automática       |
| **Docker**            | -         | Contenedor para PostgreSQL             |

---

## 3. Patrones de Diseño

### 3.1 Repository Pattern

El Repository Pattern es la base de nuestro acceso a datos:

```typescript
// 1. Definir una interfaz (contrato)
export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(product: Product, variants: ProductVariant[]): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}

// 2. Implementar con Prisma (detalles de implementación)
@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      include: { variants: true, images: true },
    });
    return products.map((p) => this.toDomainEntity(p));
  }
}

// 3. Usar la interfaz en la inyección de dependencias
providers: [
  {
    provide: PRODUCT_REPOSITORY_TOKEN,
    useClass: PrismaProductRepository,
  },
];
```

**Beneficio**: Si cambias la base de datos de Prisma a TypeORM, solo cambias la implementación, no el contrato.

### 3.2 Dependency Injection (DI)

NestJS usa DI para desacoplar componentes:

```typescript
// Token type-safe (constante = menos errores)
export const PRODUCT_REPOSITORY_TOKEN = "IProductRepository";

// En el controller
@Controller("products")
export class ProductsController {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private repository: IProductRepository,
  ) {}
}

// En el módulo
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: PRODUCT_REPOSITORY_TOKEN,
      useClass: PrismaProductRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY_TOKEN],
})
export class ProductsModule {}
```

**¿Por qué usar tokens en lugar de clases?**

- Evita dependencias circulares
- Permite múltiples implementaciones del mismo contrato
- Más flexible para testing

### 3.3 Entity Mapping

Las entidades del dominio se separan del modelo Prisma:

```typescript
// Domain Entity (lógica de negocio pura)
export class Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  variants: ProductVariant[];

  // Métodos de dominio (sin dependencias externas)
  calculateDiscount(percentage: number): number {
    return this.price * (1 - percentage / 100);
  }
}

// En el repository, convertir Prisma → Domain
private toDomainEntity(prismaProduct: any): Product {
  const product = new Product();
  product.id = prismaProduct.id;
  product.name = prismaProduct.name;
  product.slug = prismaProduct.slug;
  product.price = prismaProduct.price;
  product.variants = prismaProduct.variants.map(v =>
    this.toDomainVariant(v)
  );
  return product;
}
```

**Ventaja**: La entidad de dominio no conoce nada de la base de datos.

---

## 4. Estructura de Carpetas

```
backend/
├── src/
│   ├── app.controller.ts          ← Controlador raíz
│   ├── app.module.ts              ← Módulo principal
│   ├── main.ts                    ← Entry point
│   │
│   ├── common/                    ← Utilidades compartidas
│   │   ├── exceptions/
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   │
│   └── modules/                   ← Módulos de negocio
│       └── products/
│           ├── app/               ← Capa de aplicación
│           │   ├── ports/         ← Interfaces (contratos)
│           │   └── useCases/      ← Lógica de negocio
│           │
│           ├── domain/            ← Entidades (lógica pura)
│           │   ├── entities/
│           │   └── enums/
│           │
│           ├── infrastructure/    ← Detalles técnicos
│           │   ├── adapters/
│           │   ├── controllers/   ← HTTP endpoints
│           │   ├── dtos/          ← Schemas de entrada
│           │   ├── mappers/
│           │   └── repositories/  ← Acceso a datos
│           │
│           └── products.module.ts
│
├── prisma/
│   ├── schema.prisma              ← Definición de BD
│   └── migrations/                ← Historial de cambios
│
└── test/
    ├── products.e2e-spec.ts       ← Tests de productos
    ├── app.e2e-spec.ts
    └── jest-e2e.json              ← Config de Jest
```

### Explicación de capas:

| Capa               | Responsabilidad            | Ejemplo                |
| ------------------ | -------------------------- | ---------------------- |
| **Domain**         | Lógica pura de negocio     | Entidad Product        |
| **Application**    | Casos de uso, orquestación | Interfaces de contrato |
| **Infrastructure** | Detalles técnicos          | Prisma, HTTP, BD       |

---

## 5. Implementación del Repositorio

### Paso 1: Definir la Interfaz (Contrato)

```typescript
// src/modules/products/app/ports/product.repository.port.ts
export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  create(product: Product, variants: ProductVariant[]): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
```

**Por qué es importante:**

- Define un contrato que cualquier implementación debe cumplir
- Permite testing sin necesidad de BD real (mock)
- Hace el código agnóstico a la BD

### Paso 2: Implementar con Prisma

```typescript
// src/modules/products/infrastructure/repositories/prisma.product.repository.ts
@Injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    // 1. Consulta a BD
    const products = await this.prisma.product.findMany({
      include: {
        variants: true,
        images: true,
      },
    });

    // 2. Mapear a entidades de dominio
    return products.map((p) => this.toDomainEntity(p));
  }

  async create(product: Product, variants: ProductVariant[]): Promise<Product> {
    // 1. Generar slug automáticamente
    const slug = product.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // 2. Crear en BD con transacción
    const created = await this.prisma.product.create({
      data: {
        id: v4(), // UUID generado
        name: product.name,
        slug: slug,
        price: product.price,
        description: product.description,
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
      include: { variants: true, images: true },
    });

    // 3. Mapear respuesta
    return this.toDomainEntity(created);
  }

  // Método auxiliar para mapear
  private toDomainEntity(prismaProduct: any): Product {
    const product = new Product();
    product.id = prismaProduct.id;
    product.name = prismaProduct.name;
    product.slug = prismaProduct.slug;
    product.price = prismaProduct.price;
    product.variants =
      prismaProduct.variants?.map((v) => this.toDomainVariant(v)) || [];
    return product;
  }
}
```

**Conceptos clave:**

- `@Injectable()`: Permite inyección de dependencias
- `include: { variants: true }`: Eager loading (traer relaciones)
- Mapeo a entidades: Separar BD de lógica

---

## 6. Testing E2E con Supertest

### ¿Qué es E2E Testing?

**E2E (End-to-End)** = Probar toda la cadena HTTP:

```
Request HTTP → Router → Controller → Repository → BD → Response
```

### 6.1 Setup del Test

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/common/prisma/prisma.service";

describe("Products (e2e)", () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let categoryId: string;

  // 1. Inicializar la app de prueba
  beforeAll(async () => {
    // Compilar módulo de testing
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Importar app real
    }).compile();

    // Crear instancia de NestJS
    app = moduleFixture.createNestApplication();
    await app.init();

    // Obtener PrismaService del módulo
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Preparar datos de prueba
    const category = await prismaService.category.create({
      data: { name: "Test Category" },
    });
    categoryId = category.id;
  });

  // 2. Limpiar después de los tests
  afterAll(async () => {
    await prismaService.productVariant.deleteMany({});
    await prismaService.product.deleteMany({});
    await prismaService.category.deleteMany({});
    await app.close();
  });
});
```

### 6.2 Writing Tests

```typescript
describe("POST /products (Create)", () => {
  it("should create a product with variants", async () => {
    // ARRANGE: Preparar datos
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

    // ACT: Hacer la request
    const res = await request(app.getHttpServer())
      .post("/products") // Endpoint
      .send(createProductDto) // Body
      .set("Content-Type", "application/json"); // Headers

    // ASSERT: Verificar respuesta
    expect(res.status).toBe(201); // Status correcto
    expect(res.body).toHaveProperty("id"); // Tiene ID
    expect(res.body.name).toBe("Test Product"); // Datos correctos
  });

  it("should return 404 for non-existent product", async () => {
    const res = await request(app.getHttpServer())
      .get("/products/invalid-id")
      .expect(404); // Expect HTTP 404

    // Verificar que es un 404 válido
    expect(res.body.message).toBeDefined();
  });
});
```

### 6.3 Patrón AAA (Arrange-Act-Assert)

Cada test sigue este patrón:

```
1. ARRANGE: Preparar datos
   ↓
2. ACT: Ejecutar acción
   ↓
3. ASSERT: Verificar resultados
```

**Ejemplo real:**

```typescript
// ARRANGE
const productData = {
  name: "Laptop",
  price: 999.99,
  categoryId: validCategoryId,
};

// ACT
const response = await request(app.getHttpServer())
  .post("/products")
  .send(productData);

// ASSERT
expect(response.status).toBe(201);
expect(response.body.slug).toBe("laptop");
```

### 6.4 Métodos de Supertest

```typescript
// GET request
await request(app.getHttpServer()).get("/products/123").expect(200);

// POST request con body
await request(app.getHttpServer())
  .post("/products")
  .send({ name: "Product" })
  .expect(201);

// PUT request
await request(app.getHttpServer())
  .put("/products/123")
  .send({ name: "Updated" })
  .expect(200);

// DELETE request
await request(app.getHttpServer()).delete("/products/123").expect(204); // No Content

// Headers personalizados
await request(app.getHttpServer())
  .get("/products")
  .set("Authorization", "Bearer token")
  .set("Content-Type", "application/json")
  .expect(200);
```

---

## 7. Validación y DTOs

### DTO = Data Transfer Object

Un DTO define qué datos entra a la API:

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

export class CreateProductVariantDto {
  @IsString()
  sku: string;

  @IsString()
  size: string;

  @IsNumber()
  @Min(0)
  stock: number;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0.01)
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

### Decoradores y sus validaciones:

| Decorador           | Validación                |
| ------------------- | ------------------------- |
| `@IsString()`       | Debe ser string           |
| `@IsNumber()`       | Debe ser número           |
| `@IsEmail()`        | Debe ser email válido     |
| `@Min(0)`           | Número ≥ 0                |
| `@Max(100)`         | Número ≤ 100              |
| `@Length(5, 20)`    | String de 5-20 caracteres |
| `@Matches(/regex/)` | Match con regex           |
| `@IsOptional()`     | Campo opcional            |
| `@ValidateNested()` | Validar objetos anidados  |
| `@ArrayMinSize(1)`  | Array con mín 1 elemento  |

### Uso en Controller:

```typescript
@Post()
@HttpCode(201)
async create(@Body() createProductDto: CreateProductDto) {
  // createProductDto está validado automáticamente
  // Si hay error, NestJS lanza BadRequestException
  return this.repository.create(
    createProductDto,
    createProductDto.variants
  );
}
```

### Pipeline Global de Validación:

```typescript
// src/main.ts
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Agregar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Solo props definidas en DTO
      forbidNonWhitelisted: true, // Error si hay props extra
      transform: true, // Transformar tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(4000);
}

bootstrap();
```

**Ejemplo de validación:**

```typescript
// Request correcto
POST /products
{
  "name": "Laptop",
  "price": 999.99,
  "categoryId": "uuid",
  "variants": [...]
}
// ✅ Pasa

// Request inválido - sin name
POST /products
{
  "price": 999.99,
  "categoryId": "uuid"
}
// ❌ Error: "name should not be empty"

// Request con campo extra
POST /products
{
  "name": "Laptop",
  "price": 999.99,
  "categoryId": "uuid",
  "extraField": "value"  // Campo no permitido
}
// ❌ Error: "property extraField should not exist"
```

---

## 8. Database con Prisma

### 8.1 Schema Prisma

```prisma
// prisma/schema.prisma

// Tipos de datos
enum Size {
  ONE
  XS
  S
  M
  L
  XL
  XXL
}

// Modelo de tabla
model Product {
  id          String   @id @default(uuid())          // UUID automático
  name        String   @unique                        // Campo único
  slug        String   @unique
  price       Float    @db.Decimal(10, 2)           // 2 decimales
  description String?                               // Campo opcional

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  variants    ProductVariant[]                       // Relación 1:N
  images      ProductImage[]

  createdAt   DateTime @default(now())              // Timestamp automático
  updatedAt   DateTime @updatedAt                   // Actualización automática

  @@index([categoryId])                             // Índice para búsquedas
  @@index([slug])
}

model ProductVariant {
  id        String   @id @default(uuid())
  sku       String   @unique
  size      Size                        // Enum
  stock     Int      @default(0)

  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}
```

### 8.2 Migraciones

Las migraciones son cambios en la BD versionados:

```bash
# 1. Crear nueva migración
pnpm prisma migrate dev --name add_categories

# 2. Generar migración sin ejecutar
pnpm prisma migrate dev --name update_product_schema

# 3. Ejecutar migraciones pendientes
pnpm prisma migrate deploy

# 4. Resetear BD (útil en desarrollo)
pnpm prisma migrate reset --force
```

**Archivo de migración generado:**

```sql
-- AddProducts
-- Crear tabla Product
CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "categoryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Crear índices
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
```

### 8.3 Operaciones Prisma en Code

```typescript
// Crear
const product = await prisma.product.create({
  data: {
    name: "Laptop",
    price: 999.99,
    categoryId: catId,
  },
});

// Leer uno
const product = await prisma.product.findUnique({
  where: { id: "123" },
  include: { variants: true },
});

// Leer todos
const products = await prisma.product.findMany({
  where: { categoryId: "cat-1" },
  include: { variants: true },
  orderBy: { createdAt: "desc" },
  take: 10, // Límite
  skip: 20, // Offset para paginación
});

// Actualizar
const updated = await prisma.product.update({
  where: { id: "123" },
  data: { name: "Updated Name" },
});

// Eliminar
await prisma.product.delete({
  where: { id: "123" },
});

// Contar
const count = await prisma.product.count({
  where: { categoryId: "cat-1" },
});
```

---

## 9. Documentación con Swagger

### 9.1 Decoradores Swagger

```typescript
import { Controller, Post, Get, Body, Param, HttpCode } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";

@Controller("products")
@ApiTags("products") // Agrupar endpoints en Swagger
export class ProductsController {
  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: "Crear un nuevo producto",
    description: "Crea un producto con variantes opcionales",
  })
  @ApiBody({
    type: CreateProductDto,
    description: "Datos del producto a crear",
  })
  @ApiResponse({
    status: 201,
    description: "Producto creado exitosamente",
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: "Validación fallida",
  })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.repository.create(createProductDto);
  }

  @Get(":id")
  @ApiParam({
    name: "id",
    type: "string",
    description: "UUID del producto",
  })
  @ApiResponse({
    status: 200,
    description: "Producto encontrado",
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: "Producto no encontrado",
  })
  async findById(@Param("id") id: string) {
    return this.repository.findById(id);
  }
}
```

### 9.2 Setup en main.ts

```typescript
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle("E-Commerce API")
    .setDescription("API REST para tienda online")
    .setVersion("1.0")
    .addTag("products", "Endpoints de productos")
    .addTag("users", "Endpoints de usuarios")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(4000);
  console.log(`API disponible en http://localhost:4000/api/docs`);
}

bootstrap();
```

### 9.3 Acceso a Swagger

- **URL**: http://localhost:4000/api/docs
- **Resultado**: UI interactiva donde probar todos los endpoints
- **OpenAPI JSON**: http://localhost:4000/api-json

---

## Flujo Completo: Request → Response

```
1. CLIENT (Postman, Frontend, etc.)
   ↓ HTTP POST /products

2. NEST ROUTER
   ↓ Rutea a ProductsController

3. VALIDATION PIPE
   ↓ Valida CreateProductDto
   ├─ Chequea tipos
   ├─ Chequea decoradores (@Min, @IsString, etc)
   └─ Transforma datos

4. CONTROLLER (@Post)
   ↓ Método create(dto)
   ├─ Recibe DTO validado
   └─ Llama al repository

5. REPOSITORY (PrismaProductRepository)
   ├─ Genera UUID y slug
   ├─ Accede a Prisma
   └─ Ejecuta query SQL en PostgreSQL

6. DATABASE (PostgreSQL)
   ↓ INSERT INTO Product...
   ↓ INSERT INTO ProductVariant...

7. REPOSITORY (mapeo)
   ↓ Convierte Prisma → Domain Entity

8. CONTROLLER (respuesta)
   ↓ Status 201 + JSON

9. CLIENT
   ← Recibe Product creado
```

---

## Testing: Ciclo Completo

```
┌──────────────────────────────────────────────────────┐
│ 1. BEFOREALL: Setup                                  │
│    ├─ Compilar TestingModule con AppModule          │
│    ├─ Inicializar NestJS app                        │
│    ├─ Obtener PrismaService                         │
│    └─ Crear categoría de prueba en BD               │
├──────────────────────────────────────────────────────┤
│ 2. TEST: POST /products                             │
│    ├─ ARRANGE: Preparar DTO válido                  │
│    ├─ ACT: request(app).post().send()               │
│    ├─ BD: INSERT INTO Product + ProductVariant      │
│    └─ ASSERT: Verificar status 201 + propiedades    │
├──────────────────────────────────────────────────────┤
│ 3. TEST: GET /products/:id                          │
│    ├─ ARRANGE: Usar ID del test anterior            │
│    ├─ ACT: request(app).get()                       │
│    ├─ BD: SELECT * FROM Product WHERE id=...        │
│    └─ ASSERT: Status 200 + datos correctos          │
├──────────────────────────────────────────────────────┤
│ 4. AFTERALL: Cleanup                                │
│    ├─ DELETE productVariants                        │
│    ├─ DELETE products                               │
│    ├─ DELETE categories                             │
│    └─ Cerrar app                                    │
└──────────────────────────────────────────────────────┘
```

---

## Resumen de Decisiones Técnicas

| Decisión                 | Razón                                       |
| ------------------------ | ------------------------------------------- |
| **Repository Pattern**   | Desacoplar BD de lógica                     |
| **Dependency Injection** | Testeable y flexible                        |
| **DTOs + Validación**    | Seguridad y type-safety                     |
| **Prisma**               | Migraciones automáticas + type-safe queries |
| **E2E Tests**            | Probar flujo HTTP completo                  |
| **Supertest**            | Fácil HTTP assertions                       |
| **Swagger**              | Documentación automática                    |
| **Clean Architecture**   | Código escalable y mantenible               |

---

## Próximos Pasos para Aprender

1. **Unit Tests**: Testear services sin HTTP
2. **Auth**: Implementar JWT en headers
3. **Paginación**: Agregar limit/offset a GET /products
4. **Filtering**: Buscar por categoría, precio, etc.
5. **Error Handling**: Custom exceptions
6. **Logging**: Winston o Bunyan para logs
7. **CI/CD**: GitHub Actions para ejecutar tests
