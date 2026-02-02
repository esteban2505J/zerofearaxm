# 📋 Resumen: Arquitectura y Flujos

> Documentación de referencia rápida

---

## 1. Flujo Completo: Request → Response

```
┌─────────────────────────────────────────────────────────┐
│ 1. CLIENT (Postman, Frontend)                           │
│    POST /products                                       │
│    { name: "Laptop", price: 999.99, categoryId: "..." }│
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 2. NEST ROUTER                                          │
│    Encontrar ruta → ProductsController.create()        │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 3. VALIDATION PIPE (Global)                             │
│    ├─ ¿Es CreateProductDto?                            │
│    ├─ ¿Tiene @IsString() @IsNumber() válidos?          │
│    ├─ ¿Whitelist: solo campos permitidos?              │
│    └─ ✅ Si todo bien → transformar tipos              │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 4. CONTROLLER                                           │
│    ProductsController.create(validatedDto)             │
│    ├─ DTO está 100% validado aquí                      │
│    └─ Llama repository.create()                        │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 5. DEPENDENCY INJECTION                                 │
│    @Inject(PRODUCT_REPOSITORY_TOKEN)                   │
│    private repository: IProductRepository               │
│                                                         │
│    ¿Cuál implementación? → PrismaProductRepository      │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 6. REPOSITORY (Lógica de Acceso a Datos)                │
│    PrismaProductRepository.create()                     │
│    ├─ Generar UUID: 550e8400-e29b-41d4-a716-446655...  │
│    ├─ Generar slug: "laptop"                           │
│    └─ Llamar Prisma client                             │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 7. PRISMA CLIENT                                        │
│    Generate SQL queries:                                │
│                                                         │
│    BEGIN TRANSACTION                                    │
│    INSERT INTO Product (                               │
│      id, name, slug, price, categoryId, createdAt     │
│    ) VALUES (                                           │
│      '550e8400...', 'Laptop', 'laptop', 999.99, ...   │
│    );                                                   │
│                                                         │
│    INSERT INTO ProductVariant (                        │
│      id, sku, size, stock, productId                   │
│    ) VALUES (...)                                       │
│    COMMIT                                               │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 8. DATABASE (PostgreSQL)                                │
│    ├─ Validar constraints (FK, unique, etc)             │
│    ├─ Escribir en disco                                │
│    └─ Retornar registros creados                       │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 9. PRISMA → REPOSITORY                                  │
│    Retorna registro crudo de BD                        │
│    {                                                    │
│      id: '550e8400...',                                │
│      name: 'Laptop',                                   │
│      slug: 'laptop',                                   │
│      price: 999.99,                                    │
│      variants: [...]                                   │
│    }                                                    │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 10. MAPEO: Prisma → Entidad de Dominio                  │
│    new Product()                                        │
│    ├─ product.id = ...                                  │
│    ├─ product.name = ...                                │
│    ├─ product.slug = ...                                │
│    └─ product.variants = [mapeos de variantes]          │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 11. REPOSITORY → CONTROLLER                             │
│    Retorna Product (Entidad de Dominio)                │
└──────────────────────┬──────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ 12. CONTROLLER → CLIENTE                                │
│    HTTP 201 Created                                     │
│    {                                                    │
│      "id": "550e8400...",                              │
│      "name": "Laptop",                                 │
│      "slug": "laptop",                                 │
│      "price": 999.99,                                  │
│      "variants": [...]                                 │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Arquitectura en Capas

```
┌─────────────────────────────────────────────┐
│         API HTTP LAYER                       │ ← Externo
│  (Cliente: Postman, Frontend, Mobile)       │
└──────────────────┬──────────────────────────┘
                   │ Request/Response
┌──────────────────┴──────────────────────────┐
│     PRESENTATION LAYER                       │
│  (Controllers, Decorators, Pipes)           │
│  - @Controller                               │
│  - @Post, @Get, @Put, @Delete               │
│  - @Body, @Param                             │
│  - ValidationPipe                            │
└──────────────────┬──────────────────────────┘
                   │ Servicio
┌──────────────────┴──────────────────────────┐
│    APPLICATION LAYER                        │
│  (Use Cases, Interfaces, Lógica Orquestación)│
│  - IProductRepository (Interfaz)             │
│  - UseCases/Services                         │
└──────────────────┬──────────────────────────┘
                   │ Interfaz
┌──────────────────┴──────────────────────────┐
│     INFRASTRUCTURE LAYER                    │
│  (Implementaciones, Adaptadores, BD)         │
│  - PrismaProductRepository                   │
│  - PrismaService                             │
│  - Migrations                                │
└──────────────────┬──────────────────────────┘
                   │ SQL
┌──────────────────┴──────────────────────────┐
│       DATA LAYER                            │
│  (Database)                                 │
│  - PostgreSQL                               │
│  - Tables: Product, ProductVariant, etc     │
└─────────────────────────────────────────────┘
```

### Cada capa:

| Capa               | ¿Quién?      | ¿Qué hace?          | ¿Depende de?  |
| ------------------ | ------------ | ------------------- | ------------- |
| **Presentation**   | Controllers  | Recibe HTTP, valida | Aplicación    |
| **Application**    | Interfaces   | Define qué hacer    | Dominio       |
| **Infrastructure** | Repositorios | Cómo hacerlo        | BD específica |
| **Data**           | BD           | Almacenar datos     | Nada          |

---

## 3. Validación Pipeline

```
┌─────────────────────────────────────────┐
│ Request HTTP                            │
│ {                                       │
│   "name": "Laptop",                     │
│   "price": 999.99,                      │
│   "categoryId": "uuid",                 │
│   "extraField": "not-allowed"           │
│ }                                       │
└──────────────┬──────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│ ValidationPipe (Global)                  │
├──────────────────────────────────────────┤
│ 1. Schema Matching                       │
│    ├─ ¿Existe CreateProductDto?         │
│    └─ ✅ Sí                              │
├──────────────────────────────────────────┤
│ 2. Type Checking                         │
│    ├─ name: @IsString() → ✅             │
│    ├─ price: @IsNumber() → ✅            │
│    ├─ categoryId: @IsString() → ✅       │
│    └─ extraField → ❌ No permitido       │
├──────────────────────────────────────────┤
│ 3. Whitelist Check (whitelist: true)     │
│    ├─ Solo props de DTO                 │
│    ├─ extraField será REMOVIDO          │
│    └─ ✅ Limpiado                        │
├──────────────────────────────────────────┤
│ 4. Value Validation                      │
│    ├─ price: @Min(0.01)                 │
│    │   999.99 >= 0.01? ✅                │
│    └─ ✅ Válido                          │
├──────────────────────────────────────────┤
│ 5. Transform (transform: true)           │
│    ├─ price: "999.99" → 999.99          │
│    ├─ categoryId: uuid string → uuid    │
│    └─ ✅ Transformado                    │
└──────────────┬──────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│ Validated DTO                            │
│ {                                        │
│   "name": "Laptop",                      │
│   "price": 999.99,                       │
│   "categoryId": "uuid",                  │
│   "variants": []                         │
│ }                                        │
│ ✅ 100% Válido, Sin extraFields          │
└──────────────────────────────────────────┘
```

**Decoradores Usados:**

```typescript
@IsString()        // Campo debe ser string
@IsNumber()        // Campo debe ser número
@Min(0.01)         // Número >= 0.01
@IsOptional()      // Campo opcional
@IsArray()         // Debe ser array
@ArrayMinSize(1)   // Array con mín 1 elemento
@ValidateNested()  // Validar objetos anidados
@Type()            // Transformar tipo
```

---

## 4. Inyección de Dependencias

```
┌────────────────────────────────────────┐
│ Módulo (ProductsModule)                │
├────────────────────────────────────────┤
│ providers: [                           │
│   {                                    │
│     provide: PRODUCT_REPOSITORY_TOKEN, │
│     useClass: PrismaProductRepository  │
│   }                                    │
│ ]                                      │
└────────┬──────────────────────────────┘
         │
         ├─ ¿Quién pide IProductRepository?
         │   → ProductsController
         │
         ├─ ¿Qué implementación usar?
         │   → PrismaProductRepository
         │
         └─ NestJS inyecta automáticamente
            ✅ repository = new PrismaProductRepository()
               con PrismaService automáticamente inyectado
```

**Ventajas:**

1. **Testeable**: Reemplazar con mock fácilmente
2. **Flexible**: Cambiar implementación sin cambiar controller
3. **Desacoplado**: Controller no sabe cómo crear repository

---

## 5. Testing E2E Ciclo Completo

```
╔════════════════════════════════════════════╗
║          Test Suite: Products             ║
╠════════════════════════════════════════════╣
║                                            ║
║ beforeAll()                                ║
║ ├─ Compilar TestingModule                 ║
║ ├─ Inicializar NestJS app                 ║
║ ├─ Obtener PrismaService                  ║
║ ├─ Crear categoría de prueba              ║
║ └─ ✅ App lista para tests                 ║
║                                            ║
║ ─────────────────────────────────────     ║
║                                            ║
║ TEST 1: POST /products                    ║
║ ├─ ARRANGE: Preparar DTO válido           ║
║ ├─ ACT: request(app).post().send()        ║
║ ├─ BD: INSERT Product, ProductVariant     ║
║ └─ ASSERT: status 201, tiene id, slug     ║
║   ✅ PASS (45ms)                           ║
║                                            ║
║ ─────────────────────────────────────     ║
║                                            ║
║ TEST 2: GET /products                     ║
║ ├─ ARRANGE: (sin prep necesaria)          ║
║ ├─ ACT: request(app).get()                ║
║ ├─ BD: SELECT * FROM Product              ║
║ └─ ASSERT: array con elementos            ║
║   ✅ PASS (12ms)                           ║
║                                            ║
║ ─────────────────────────────────────     ║
║                                            ║
║ TEST 3: GET /products/:id                 ║
║ ├─ ARRANGE: Usar productId del TEST 1     ║
║ ├─ ACT: request(app).get(id)              ║
║ ├─ BD: SELECT WHERE id = ...              ║
║ └─ ASSERT: retorna producto correcto      ║
║   ✅ PASS (8ms)                            ║
║                                            ║
║ ─────────────────────────────────────     ║
║                                            ║
║ afterAll()                                 ║
║ ├─ DELETE productVariants                 ║
║ ├─ DELETE products                        ║
║ ├─ DELETE categories                      ║
║ ├─ Close app                              ║
║ └─ ✅ Cleanup completo                    ║
║                                            ║
╠════════════════════════════════════════════╣
║ RESULTADO:                                 ║
║ Test Suites: 1 passed, 1 total            ║
║ Tests: 6 passed, 6 total                  ║
║ Time: 2.631s                              ║
╚════════════════════════════════════════════╝
```

---

## 6. Comparativa: Antes vs Después

### ANTES (Sin estructura)

```typescript
// ❌ Todo mezclado
app.post("/products", async (req, res) => {
  const rawData = req.body;
  // ❌ Sin validación clara

  // ❌ SQL escrito manualmente
  const result = db.query(`
    INSERT INTO product VALUES (...)
  `);

  // ❌ Difícil testear
  res.json(result);
});
```

**Problemas:**

- No hay validación automática
- SQL vulnerable a injection
- No se puede testear fácilmente
- Toda la lógica en un lugar
- Acoplado a una BD específica

### DESPUÉS (Con Clean Architecture)

```typescript
// ✅ Separación clara
@Controller('products')
export class ProductsController {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private repository: IProductRepository
  ) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    // ✅ DTO validado automáticamente
    return this.repository.create(createProductDto);
  }
}

// ✅ Interfaz define contrato
export interface IProductRepository {
  create(product: Product): Promise<Product>;
}

// ✅ Prisma con type-safety
export class PrismaProductRepository implements IProductRepository {
  async create(product: Product): Promise<Product> {
    // ✅ Prisma genera SQL seguro
    return this.prisma.product.create({ ... });
  }
}
```

**Beneficios:**

- ✅ Validación automática y global
- ✅ SQL type-safe (Prisma)
- ✅ Fácil de testear (interfaces)
- ✅ Lógica separada en capas
- ✅ Desacoplado de BD específica
- ✅ Fácil agregar features

---

## 7. Guía de Archivos Generados

```
backend/
├── src/
│   ├── modules/products/
│   │   ├── app/
│   │   │   └── ports/
│   │   │       ├── product.repository.port.ts  [Interfaz]
│   │   │       └── product.repository.token.ts [Token DI]
│   │   │
│   │   ├── domain/
│   │   │   └── entities/
│   │   │       ├── product.entity.ts      [Lógica pura]
│   │   │       └── productVariant.entity.ts
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── controllers/
│   │   │   │   └── products.controller.ts [HTTP endpoints]
│   │   │   ├── repositories/
│   │   │   │   └── prisma.product.repository.ts [BD]
│   │   │   └── dtos/
│   │   │       └── createProductDTO.ts    [Validación]
│   │   │
│   │   └── products.module.ts             [DI setup]
│   │
│   └── common/
│       └── prisma/
│           ├── prisma.module.ts
│           └── prisma.service.ts
│
├── prisma/
│   ├── schema.prisma                      [Esquema BD]
│   └── migrations/
│       └── 20260202233058_update_product_schema
│           └── migration.sql               [SQL generado]
│
└── test/
    ├── products.e2e-spec.ts              [Tests]
    ├── jest-e2e.json                      [Config Jest]
    └── setup.ts                           [Setup env]
```

---

## 8. Comandos Útiles Resumen

```bash
# Inicializar
docker-compose up -d                      # Inicia PostgreSQL
cd backend && pnpm install               # Instala dependencias

# Prisma
pnpm prisma generate                     # Genera cliente
pnpm prisma migrate dev --name "description"  # Crea migración
pnpm prisma migrate reset --force        # Limpia BD (dev)
pnpm prisma db push                      # Sincroniza esquema

# Testing
pnpm test:e2e                            # Ejecuta tests
pnpm test:e2e --watch                    # Watch mode
pnpm test:e2e:coverage                   # Coverage report
pnpm test:e2e --forceExit                # Cierra después

# Server
pnpm start                               # Inicia server
pnpm start:dev                           # Watch mode
pnpm build                               # Build producción

# Swagger
# Abre: http://localhost:4000/api/docs
```

---

## 9. Checklist: Qué Hicimos

- ✅ Definir interfaz de repositorio
- ✅ Crear entidades de dominio
- ✅ Implementar repository con Prisma
- ✅ Configurar inyección de dependencias
- ✅ Crear DTOs con validación
- ✅ Agregar ValidationPipe global
- ✅ Implementar controller con endpoints
- ✅ Agregar decoradores Swagger
- ✅ Crear migraciones Prisma
- ✅ Configurar Jest para E2E
- ✅ Escribir tests E2E completos
- ✅ Todos los tests passing ✅
