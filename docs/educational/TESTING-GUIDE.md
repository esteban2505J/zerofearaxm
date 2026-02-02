# 🧪 Guía Completa: Testing E2E con NestJS + Supertest

> Entender cómo hacer tests como se hizo en el proyecto

## 1. Conceptos Fundamentales de Testing

### Tipos de Testing (Pirámide)

```
        /\
       /  \       E2E Tests (1 test = todo integrado)
      /────\      ← Más lento pero más realista
     /      \
    /────────\    Integration Tests (varios componentes)
   /          \
  /────────────\ Unit Tests (componentes aislados)
 /______________\ ← Más rápido pero menos realista
```

### Niveles de Testing en nuestro proyecto:

```
┌─────────────────────────────────────────┐
│ E2E Testing (Lo que implementamos)       │
├─────────────────────────────────────────┤
│ - Prueba HTTP completo                  │
│ - Involucra controller + repository + BD │
│ - Verifica flujo de datos                │
│ - Detecta problemas de integración       │
└─────────────────────────────────────────┘
```

---

## 2. Setup del Ambiente de Prueba

### Paso 1: Configuración de Jest

```json
// backend/test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$", // Solo archivos .e2e-spec.ts
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest" // Transformar TypeScript
  },
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/../src/$1" // Resolver imports
  },
  "setupFilesAfterEnv": ["<rootDir>/setup.ts"],
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage"
}
```

### Paso 2: Setup de Variables de Entorno

```typescript
// backend/test/setup.ts
import * as path from "path";
import * as dotenv from "dotenv";

// Cargar variables de entorno para tests
const envPath = path.resolve(__dirname, "../.env.test");
dotenv.config({ path: envPath });

console.log(`Using database: ${process.env.DATABASE_URL}`);
```

```env
# backend/.env.test
DATABASE_URL="postgresql://admin:zerofear2505@localhost:5433/zeroFear_db"
PORT=4000
NODE_ENV=test
```

### Paso 3: Package.json Script

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

## 3. Estructura de un Test E2E

### Template Básico

```typescript
// test/products.e2e-spec.ts

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";
import { PrismaService } from "./../src/common/prisma/prisma.service";

describe("Products (e2e)", () => {
  // 1️⃣ Variables globales para el test
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let categoryId: string;

  // 2️⃣ Setup antes de todos los tests
  beforeAll(async () => {
    // Crear módulo de testing
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Inicializar NestJS app
    app = moduleFixture.createNestApplication();
    await app.init();

    // Obtener servicios inyectados
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Preparar datos para tests
    const category = await prismaService.category.create({
      data: { name: "Test Category" },
    });
    categoryId = category.id;
  });

  // 3️⃣ Cleanup después de todos los tests
  afterAll(async () => {
    // Limpiar BD
    await prismaService.productVariant.deleteMany({});
    await prismaService.product.deleteMany({});
    await prismaService.category.deleteMany({});

    // Cerrar app
    await app.close();
  });

  // 4️⃣ Tests agrupados por funcionalidad
  describe("POST /products (Create)", () => {
    it("should create a product with variants", async () => {
      // Test code...
    });
  });

  describe("GET /products (Find All)", () => {
    it("should return all products", async () => {
      // Test code...
    });
  });
});
```

---

## 4. Escribiendo Tests Individuales

### Test 1: Crear Producto (POST)

```typescript
describe("POST /products (Create)", () => {
  let productId: string;
  let productSlug: string;

  it("should create a product with variants", async () => {
    // 🔵 ARRANGE: Preparar datos de entrada
    const createProductDto = {
      name: "Test Product", // Campo requerido
      price: 29.99, // Validado: Min(0.01)
      categoryId: categoryId, // Foreign key válido
      variants: [
        {
          sku: "TEST-001-M", // SKU único
          size: "M", // Enum válido
          stock: 10, // Número positivo
        },
      ],
    };

    // 🟢 ACT: Hacer HTTP request
    const res = await request(app.getHttpServer())
      .post("/products") // Endpoint
      .send(createProductDto) // Body
      .set("Content-Type", "application/json"); // Headers

    // 🔴 ASSERT: Verificar respuesta
    expect(res.status).toBe(201); // ✅ Status correcto
    expect(res.body).toHaveProperty("id"); // ✅ Tiene ID
    expect(res.body.name).toBe("Test Product"); // ✅ Nombre correcto
    expect(res.body).toHaveProperty("slug"); // ✅ Slug generado
    expect(res.body.price).toBe(29.99); // ✅ Precio correcto

    // Guardar para otros tests
    productId = res.body.id;
    productSlug = res.body.slug;
  });

  it("should fail validation if price is negative", async () => {
    const invalidDto = {
      name: "Invalid Product",
      price: -10, // ❌ Inválido
      categoryId: categoryId,
    };

    const res = await request(app.getHttpServer())
      .post("/products")
      .send(invalidDto);

    // Validación fallida
    expect(res.status).toBe(400); // Bad Request
    expect(res.body.message).toContain("price"); // Mensaje de error
  });

  it("should fail if categoryId does not exist", async () => {
    const invalidDto = {
      name: "Another Product",
      price: 29.99,
      categoryId: "invalid-uuid-12345", // ❌ No existe
    };

    const res = await request(app.getHttpServer())
      .post("/products")
      .send(invalidDto);

    // Foreign key constraint violated
    expect(res.status).toBe(500); // Error de servidor
  });
});
```

### Test 2: Obtener Todos (GET)

```typescript
describe("GET /products (Find All)", () => {
  it("should return all products", async () => {
    // Primero crear un producto (desde test anterior tenemos productId)

    // 🟢 ACT: Hacer request
    const res = await request(app.getHttpServer())
      .get("/products") // Sin parámetros
      .expect(200); // Expect status 200

    // 🔴 ASSERT: Verificar respuesta
    expect(Array.isArray(res.body)).toBe(true); // ✅ Es un array
    expect(res.body.length).toBeGreaterThan(0); // ✅ Tiene elementos

    // Verificar estructura del primer producto
    const firstProduct = res.body[0];
    expect(firstProduct).toHaveProperty("id");
    expect(firstProduct).toHaveProperty("name");
    expect(firstProduct).toHaveProperty("price");
    expect(firstProduct).toHaveProperty("variants");
  });

  it("should return empty array if no products", async () => {
    // Limpiar productos primero
    await prismaService.product.deleteMany({});

    const res = await request(app.getHttpServer()).get("/products").expect(200);

    expect(res.body).toEqual([]); // Array vacío
  });
});
```

### Test 3: Obtener por ID (GET :id)

```typescript
describe("GET /products/:id (Find by ID)", () => {
  it("should return a product by ID", async () => {
    // Usar el productId creado en test anterior

    // 🟢 ACT: Request a ID específico
    const res = await request(app.getHttpServer())
      .get(`/products/${productId}`) // Usar variable del test anterior
      .expect(200);

    // 🔴 ASSERT: Verificar producto retornado
    expect(res.body.id).toBe(productId);
    expect(res.body.name).toBe("Test Product");
    expect(res.body.price).toBe(29.99);
  });

  it("should return 404 if product does not exist", async () => {
    // ID que definitivamente no existe
    const fakeId = "ffffffff-ffff-ffff-ffff-ffffffffffff";

    const res = await request(app.getHttpServer())
      .get(`/products/${fakeId}`)
      .expect(404); // Not Found

    expect(res.body.message).toBeDefined();
  });

  it("should return 404 if ID format is invalid", async () => {
    const res = await request(app.getHttpServer())
      .get("/products/not-a-uuid")
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });
});
```

### Test 4: Obtener por Slug (GET /slug/:slug)

```typescript
describe("GET /products/slug/:slug (Find by Slug)", () => {
  it("should return a product by slug", async () => {
    // 🟢 ACT: Request a slug específico
    const res = await request(app.getHttpServer())
      .get(`/products/slug/${productSlug}`) // Del test POST
      .expect(200);

    // 🔴 ASSERT: Verificar producto
    expect(res.body.slug).toBe(productSlug);
    expect(res.body.id).toBe(productId);
  });

  it("should return 404 if slug does not exist", async () => {
    const res = await request(app.getHttpServer())
      .get("/products/slug/non-existent-product")
      .expect(404);

    expect(res.body.message).toBeDefined();
  });
});
```

---

## 5. Métodos de Supertest en Detalle

### GET Request

```typescript
// Básico
const res = await request(app.getHttpServer()).get("/products").expect(200);

// Con query parameters
const res = await request(app.getHttpServer())
  .get("/products")
  .query({ categoryId: "cat-1", limit: 10 })
  .expect(200);

// Con headers personalizados
const res = await request(app.getHttpServer())
  .get("/products")
  .set("Authorization", "Bearer token123")
  .set("Accept", "application/json")
  .expect(200);
```

### POST Request

```typescript
// Con body JSON
const res = await request(app.getHttpServer())
  .post("/products")
  .send({
    name: "Product",
    price: 99.99,
    categoryId: "uuid",
  })
  .expect(201);

// Con headers
const res = await request(app.getHttpServer())
  .post("/products")
  .set("Content-Type", "application/json")
  .send(createProductDto)
  .expect(201);

// Chain múltiples assertions
const res = await request(app.getHttpServer())
  .post("/products")
  .send(createProductDto)
  .expect(201)
  .expect("Content-Type", /json/);
```

### PUT Request

```typescript
const res = await request(app.getHttpServer())
  .put(`/products/${productId}`)
  .send({
    name: "Updated Product",
    price: 149.99,
  })
  .expect(200);
```

### DELETE Request

```typescript
const res = await request(app.getHttpServer())
  .delete(`/products/${productId}`)
  .expect(204); // No Content
```

---

## 6. Assertions Comunes en Jest

```typescript
// Igualdad
expect(value).toBe(5); // Igualdad estricta (===)
expect(value).toEqual(expectedObject); // Igualdad profunda

// Números
expect(price).toBeGreaterThan(0);
expect(stock).toBeLessThanOrEqual(100);
expect(count).toBeCloseTo(5, 1);

// Strings
expect(name).toContain("Product");
expect(email).toMatch(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
expect(message).toHaveLength(10);

// Arrays
expect(products).toHaveLength(5);
expect(products).toContain(newProduct);
expect(categories).toEqual(expectedCategories);

// Objetos
expect(product).toHaveProperty("id");
expect(product).toHaveProperty("name", "Laptop");
expect(product).toMatchObject({ name: "Laptop", price: 999 });

// Booleanos
expect(isActive).toBe(true);
expect(hasError).toBeFalsy();

// Null/Undefined
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Tipos
expect(product).toBeTruthy();
expect(error).toBeFalsy();

// Negación
expect(value).not.toBe(10);
expect(array).not.toContain("test");

// Errores
expect(() => {
  throw new Error("Error!");
}).toThrow("Error!");
```

---

## 7. Data Sharing Entre Tests

### Usar variables globales en describe

```typescript
describe("Products Flow", () => {
  let productId: string;
  let productSlug: string;

  it("1. should create product", async () => {
    const res = await request(app.getHttpServer())
      .post("/products")
      .send(createProductDto)
      .expect(201);

    // Guardar para tests posteriores
    productId = res.body.id;
    productSlug = res.body.slug;
  });

  it("2. should get product by ID", async () => {
    // Usa el productId del test anterior
    const res = await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .expect(200);

    expect(res.body.id).toBe(productId);
  });

  it("3. should get product by slug", async () => {
    // Usa el productSlug del test anterior
    const res = await request(app.getHttpServer())
      .get(`/products/slug/${productSlug}`)
      .expect(200);

    expect(res.body.slug).toBe(productSlug);
  });
});
```

---

## 8. Setup y Teardown (beforeAll, afterAll, beforeEach, afterEach)

```typescript
describe("Products Tests", () => {
  let app: INestApplication;
  let categoryId: string;

  // 🟢 Se ejecuta UNA VEZ antes de TODOS los tests
  beforeAll(async () => {
    console.log("🟢 Inicializando app...");
    // Crear app, inicializar datos
  });

  // 🔵 Se ejecuta ANTES de CADA test
  beforeEach(async () => {
    console.log("🔵 Preparando para test...");
    // Limpiar estado, crear datos temporales
  });

  // 🟡 Se ejecuta DESPUÉS de CADA test
  afterEach(async () => {
    console.log("🟡 Limpiando después de test...");
    // Limpiar datos temporales del test
  });

  // 🔴 Se ejecuta UNA VEZ después de TODOS los tests
  afterAll(async () => {
    console.log("🔴 Cerrando app...");
    // Cerrar conexiones, limpiar recursos
  });

  it("test 1", async () => {});
  it("test 2", async () => {});
});

// Orden de ejecución:
// 1. beforeAll()
// 2. beforeEach()
// 3. test 1
// 4. afterEach()
// 5. beforeEach()
// 6. test 2
// 7. afterEach()
// 8. afterAll()
```

---

## 9. Testing Edge Cases

### Test de validación

```typescript
it("should fail if required field is missing", async () => {
  const invalidDto = {
    // name: 'Product', // ❌ Missing required field
    price: 99.99,
    categoryId: "uuid",
  };

  const res = await request(app.getHttpServer())
    .post("/products")
    .send(invalidDto)
    .expect(400);

  expect(res.body.message).toContain("name");
});

it("should fail if field type is wrong", async () => {
  const invalidDto = {
    name: "Product",
    price: "not-a-number", // ❌ Wrong type
    categoryId: "uuid",
  };

  const res = await request(app.getHttpServer())
    .post("/products")
    .send(invalidDto)
    .expect(400);
});

it("should fail if field has invalid value", async () => {
  const invalidDto = {
    name: "Product",
    price: -99.99, // ❌ Negative price invalid
    categoryId: "uuid",
  };

  const res = await request(app.getHttpServer())
    .post("/products")
    .send(invalidDto)
    .expect(400);

  expect(res.body.message).toContain("price");
});

it("should fail with forbidden properties", async () => {
  const invalidDto = {
    name: "Product",
    price: 99.99,
    categoryId: "uuid",
    secretField: "not-allowed", // ❌ Extra field (whitelist: true)
  };

  const res = await request(app.getHttpServer())
    .post("/products")
    .send(invalidDto)
    .expect(400);

  expect(res.body.message).toContain("secretField");
});
```

### Test de dependencias

```typescript
it("should fail if foreign key does not exist", async () => {
  const invalidDto = {
    name: "Product",
    price: 99.99,
    categoryId: "00000000-0000-0000-0000-000000000000", // ❌ UUID válido pero no existe
  };

  const res = await request(app.getHttpServer())
    .post("/products")
    .send(invalidDto);

  // Constraint violation
  expect(res.status).toBe(500);
});
```

---

## 10. Running Tests

### Comandos útiles

```bash
# Ejecutar todos los tests E2E
pnpm test:e2e

# Ejecutar un test específico
pnpm test:e2e -- products.e2e-spec.ts

# Ejecutar tests en watch mode (reload automático)
pnpm test:e2e:watch

# Ejecutar con coverage
pnpm test:e2e:coverage

# Ejecutar con timeout mayor
pnpm test:e2e --testTimeout=30000

# Modo verbose (mostrar todos los tests)
pnpm test:e2e --verbose

# Forcexit después de tests
pnpm test:e2e --forceExit
```

### Output de Tests

```
 PASS  test/products.e2e-spec.ts
  Products (e2e)
    POST /products (Create)
      ✓ should create a product with variants (45ms)
    GET /products (Find All)
      ✓ should return all products (12ms)
    GET /products/:id (Find by ID)
      ✓ should return a product by ID (8ms)
    404 Scenarios
      ✓ should return 404 for non-existent product (5ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        2.631 s
```

---

## 11. Troubleshooting Común

### Problema 1: PrismaClientInitializationError

```
Error: `PrismaClient` needs to be constructed with non-empty options
```

**Solución:** Usar PrismaService inyectado, no crear nuevo PrismaClient

```typescript
// ❌ MAL
const prisma = new PrismaClient();

// ✅ CORRECTO
const prismaService = moduleFixture.get<PrismaService>(PrismaService);
```

### Problema 2: Test timeout

```
Error: Jest did not exit one second after the test completed
```

**Solución:** Agregar --forceExit o aumentar timeout

```bash
pnpm test:e2e --forceExit
pnpm test:e2e --testTimeout=30000
```

### Problema 3: Database connection failed

```
Error: Client is unable to connect to the database
```

**Solución:** Verificar que PostgreSQL está corriendo

```bash
docker-compose ps  # Ver si está corriendo
docker-compose up -d  # Iniciar si no está
```

### Problema 4: Tests running in parallel, causing conflicts

**Solución:** Agregar --runInBand

```bash
pnpm test:e2e --runInBand  # Tests secuenciales
```

---

## Checklist para Escribir Tests

- [ ] Nombre descriptivo del test
- [ ] Arrange: Preparar datos
- [ ] Act: Ejecutar acción
- [ ] Assert: Verificar resultado
- [ ] Guardar datos para tests posteriores
- [ ] Limpiar en afterAll()
- [ ] Verificar casos de error
- [ ] Verificar validaciones
- [ ] Verificar foreign keys
- [ ] Verificar status codes correctos
