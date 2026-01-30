# Plan estratégico: E-commerce en Clean Architecture

**Stack:** NestJS · Prisma · PostgreSQL · Next.js  
**Objetivo:** Backend en Clean Architecture, dos perspectivas (admin y cliente), estructura escalable.

---

## Estado actual del proyecto

| Área | Situación |
|------|-----------|
| **Backend** | Nest con `AppModule`, `AppController`, `AppService`; módulo `prisma` con `PrismaService`. `AppModule` importa `AuthModule` que no existe (hay que crear o quitar el import). |
| **Prisma** | Schema con `Product`, `Category`; conexión en `prisma.config.ts`. |
| **Frontend** | Next.js básico (layout, page). |

---

## 1. Clean Architecture en el backend

**Regla de dependencia:** las dependencias solo apuntan hacia dentro. El dominio no conoce Nest ni Prisma; la aplicación no conoce HTTP ni la BD.

```
┌─────────────────────────────────────────────────────────────────┐
│  Frameworks & Drivers (Nest, Prisma, Express, PostgreSQL)        │
├─────────────────────────────────────────────────────────────────┤
│  Interface Adapters (Controllers, Presenters, Repo Implementations)│
├─────────────────────────────────────────────────────────────────┤
│  Application - Use Cases + Ports (interfaces)                     │
├─────────────────────────────────────────────────────────────────┤
│  Domain - Entities + Value Objects                               │
└─────────────────────────────────────────────────────────────────┘
         ↑ Todas las dependencias apuntan hacia dentro
```

### Capas (de dentro hacia fuera)

| Capa | Responsabilidad | Depende de | No debe contener |
|------|-----------------|------------|------------------|
| **Domain** | Entidades, value objects, reglas de negocio puras | Nada (solo TypeScript) | Nest, Prisma, DTOs, HTTP |
| **Application** | Use cases, orquestación, flujos | Domain + Ports (interfaces) | Implementaciones concretas, decoradores Nest |
| **Interface Adapters** | Traducir entre mundo exterior y aplicación | Application + Domain | Lógica de negocio; aquí sí Nest y Prisma |
| **Frameworks & Drivers** | Nest, Prisma, Express, PostgreSQL | Todo lo anterior | Lógica de negocio |

- **Ports:** interfaces que definen qué necesita el caso de uso del exterior (ej. `ProductRepository`, `TokenService`).
- **Adapters:** implementaciones concretas (`PrismaProductRepository`, controladores HTTP).

---

## 2. Dos perspectivas: Admin vs Cliente

| Perspectiva | Quién | Ejemplos |
|-------------|--------|----------|
| **Admin** | Gestión interna | CRUD productos/categorías, pedidos, usuarios, reportes |
| **Cliente** | Tienda pública | Listar productos, carrito, checkout, “mi cuenta” |

**Enfoque:** prefijos de ruta (`/api/admin/*` y `/api/*`). Un solo backend; la diferencia es autorización. Los mismos use cases se reutilizan desde controllers admin y públicos.

---

## 3. Estructura de carpetas (escalable)

Cada módulo de negocio (bounded context) tiene sus propias capas.

```
backend/src/
  main.ts
  app.module.ts

  shared/                    # Opcional: kernel compartido
    domain/
    application/

  modules/
    catalog/
      domain/
        entities/
        value-objects/
        repositories/        # Ports (interfaces)
      application/
        use-cases/
        ports/
        dto/
      infrastructure/
        persistence/
        http/
          controllers/
          presenters/
          dto/
        catalog.module.ts
    auth/
      domain/
      application/
      infrastructure/
      auth.module.ts
    orders/
      ...

  prisma/
    prisma.module.ts
    prisma.service.ts
```

**Regla:** ningún archivo en `domain/` ni en `application/use-cases/` debe importar desde `infrastructure/` ni `prisma/` ni usar decoradores de Nest.

---

## 4. Escalabilidad a futuro

- **Nuevos canales:** GraphQL, gRPC, colas; mismos use cases, nuevos adapters.
- **Nuevos bounded contexts:** nuevos módulos bajo `modules/*` con la misma estructura.
- **Shared kernel:** solo `shared/` para tipos realmente compartidos.
- **Microservicios:** cada módulo puede extraerse; los adapters pasan a ser clientes HTTP o mensajes.
- **Tests:** dominio y use cases testeables con mocks de ports, sin Nest ni BD.

---

## 5. Fases de implementación

| Fase | Contenido |
|------|-----------|
| **0** | Base y convenciones: arreglar imports, Prisma, prefijo `api`, CORS, estructura Clean Architecture y ejemplo mínimo (port + adapter + use case). |
| **1** | Catálogo: domain (Product, Category, port ProductRepository), application (CreateProduct, ListProducts, GetProduct), infrastructure (PrismaProductRepository, controllers). |
| **2** | Autenticación: auth module, User, ports, use cases Login/Register/ValidateToken, JWT/Passport, guard para `/api/admin/*`. |
| **3** | Pedidos y carrito: domain Order/OrderItem, use cases, adapters Prisma, controllers `/api/orders`, `/api/cart`. |
| **4** | Panel admin: endpoints admin reutilizando use cases de catalog y orders; guard de rol. |
| **5** | Frontend Next.js: tienda `(store)/*`, admin `(admin)/*`, consumo del API con token. |

---

## 6. Patrones

- **Repository (port + adapter):** interfaz en domain/application; implementación Prisma en infrastructure.
- **Use Case:** una clase por acción; recibe ports por constructor; no conoce HTTP ni Prisma.
- **DTOs:** en infrastructure (HTTP); validación con class-validator; no exponer entidades en la API.
- **DI:** Nest como composition root; módulos registran “para este port, este adapter”.
- **Guards:** en infrastructure; protegen rutas admin (JWT + rol).

---

## 7. Orden de trabajo

1. **Fase 0** – Base y convenciones + ejemplo mínimo Clean Architecture.
2. **Fase 1** – Catálogo completo.
3. **Fase 2** – Auth y protección admin.
4. **Fase 3** – Pedidos (y carrito).
5. **Fase 4** – Endpoints admin.
6. **Fase 5** – Frontend Next.js.

---

## Fase 0 – Detalle (primera fase a ejecutar)

### Objetivos

1. Dejar el backend estable y con convenciones claras.
2. Aplicar la estructura Clean Architecture con un ejemplo mínimo (un port, un adapter, un use case).

### Tareas concretas

1. **Corregir `app.module.ts`**
   - Quitar el import de `AuthModule` hasta implementar auth, **o** crear un `AuthModule` mínimo vacío (sin controllers) para que el build no falle.

2. **Registrar Prisma en la aplicación**
   - Importar `PrismaModule` en `AppModule` para que `PrismaService` esté disponible en todo el backend.

3. **Configurar API y CORS en `main.ts`**
   - Establecer prefijo global `api` (`app.setGlobalPrefix('api')`).
   - Habilitar CORS para el origen del frontend (ej. `http://localhost:3001` si Next corre en otro puerto).

4. **Estructura Clean Architecture – ejemplo mínimo**
   - Crear la estructura de carpetas del módulo `catalog`:
     - `modules/catalog/domain/entities/` (opcional una entidad mínima o solo el port).
     - `modules/catalog/domain/repositories/` con el **port** `ProductRepository` (interfaz con un método, ej. `findAll()`).
     - `modules/catalog/application/use-cases/` con un use case mínimo, ej. `ListProductsUseCase`, que reciba el port por constructor y llame a `findAll()`.
     - `modules/catalog/infrastructure/persistence/` con `PrismaProductRepository` que implemente el port usando `PrismaService`.
     - `modules/catalog/infrastructure/http/controllers/` con un controller Nest que exponga `GET /api/products` y llame al use case.
   - Crear `CatalogModule` que registre: provider del port → `PrismaProductRepository`, provider del use case inyectando el port, controller. Importar `PrismaModule` y `CatalogModule` en `AppModule`.

5. **Verificación**
   - `pnpm run build` en backend sin errores.
   - Llamada a `GET /api/products` devuelve lista (vacía o con datos según BD).

Al terminar la Fase 0 tendrás un flujo completo: HTTP → Controller → Use Case → Port → Adapter (Prisma) → PostgreSQL, listo para extender en la Fase 1 con más entidades y casos de uso del catálogo.
