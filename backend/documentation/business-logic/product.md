# Product – Business & Clean Architecture

This document describes the **Product** domain from a business perspective and from a **Clean Architecture** viewpoint: what a product is, how it behaves, and how it is structured in layers (domain, application, infrastructure). It also reflects **normalization** and **database best practices** (variants for sizes/SKU, separate images table, indexes).

---

## 1. Business perspective

### 1.1 What is a product?

A **product** is a sellable item in the e-commerce catalog. It has identity, descriptive data, base pricing, and belongs to a category. **Stock and SKU** are held at **variant** level (e.g. per size), so the same product can have multiple variants (tallas) with their own stock and SKU. This supports both **t-shirts (by size)** and **simple items** (e.g. supplements) via a single variant with size `ONE`.

### 1.2 Data model and normalization

- **Product**: Catalog entity (name, slug, description, base price, category). No stock here; one product has one or many **variants**.
- **ProductVariant**: One row per size (or “ONE” for no size). Holds `sku` (unique), `size`, `stock`, and optional `price` / `purchasePrice` override.
- **ProductImage**: One row per image; avoids storing arrays and allows `sortOrder`, `altText`, `isPrimary`.

**Normalization:** No repeated name/description per size; one product, N variants. Images in a separate table with `productId` FK and indexes for listados.

### 1.3 Attributes

#### Product

| Attribute      | Type     | Required | Description                                                |
|----------------|----------|----------|------------------------------------------------------------|
| id             | UUID     | Yes      | Unique identifier (system-generated).                     |
| name           | string   | Yes      | Display name; unique in the catalog.                       |
| slug           | string   | Yes      | URL-friendly unique identifier (SEO, deep links).         |
| description    | string   | No       | Long text or HTML for the product page.                   |
| price          | number   | Yes      | Base sale price; must be > 0. Variant can override.       |
| purchasePrice  | number   | No       | Cost price (margins, analytics).                          |
| imageUrl       | string   | No       | Main image URL (or first of gallery).                     |
| categoryId     | UUID     | Yes      | Reference to the category.                                |
| createdAt      | datetime | Yes      | When the record was created.                              |
| updatedAt      | datetime | Yes      | When the record was last updated.                         |

#### ProductVariant

| Attribute      | Type     | Required | Description                                                |
|----------------|----------|----------|------------------------------------------------------------|
| id             | UUID     | Yes      | Unique identifier.                                        |
| productId      | UUID     | Yes      | Reference to the product.                                 |
| sku            | string   | Yes      | Unique SKU (inventory, integrations, orders).               |
| size           | Size     | Yes      | Enum: ONE, XS, S, M, L, XL, XXL (ONE = no size).           |
| stock          | integer  | Yes      | Available quantity; must be ≥ 0.                          |
| price          | number   | No       | Override; if null, use Product.price.                      |
| purchasePrice  | number   | No       | Cost per variant (optional).                               |
| createdAt      | datetime | Yes      | When the record was created.                              |
| updatedAt      | datetime | Yes      | When the record was last updated.                          |

#### ProductImage

| Attribute  | Type    | Required | Description                              |
|------------|---------|----------|------------------------------------------|
| id         | UUID    | Yes      | Unique identifier.                       |
| productId  | UUID    | Yes      | Reference to the product.                |
| url        | string  | Yes      | Image URL.                               |
| altText    | string  | No       | Alt text (accessibility, SEO).           |
| sortOrder  | integer | Yes      | Order in gallery (default 0).             |
| isPrimary  | boolean | Yes      | Whether this is the main image.           |

#### Size (enum)

- `ONE` – Products without size (e.g. supplements).
- `XS`, `S`, `M`, `L`, `XL`, `XXL` – T-shirt sizes.

### 1.4 Business rules (invariants)

- **Product**
  - **Name**: non-empty, unique in the catalog.
  - **Slug**: non-empty, unique; typically derived from name.
  - **Price**: base price > 0.
  - **Category**: must reference an existing category.
  - Every product has **at least one variant** (e.g. one row with size `ONE` for simple products).
- **ProductVariant**
  - **SKU**: unique across the catalog.
  - **Stock**: ≥ 0.
  - **Price**: if set, must be > 0; if null, product base price is used.
  - **Size**: must be a valid enum value; uniqueness of (productId, size) is enforced at application level if needed (one variant per size per product).
- **ProductImage**
  - **sortOrder**: used to order images; at most one `isPrimary = true` per product (application rule).

### 1.5 Workflows (who does what)

| Workflow              | Who        | Description                                          |
|-----------------------|------------|------------------------------------------------------|
| List products         | Store/API  | Return products (e.g. with main image, min price).   |
| Get one product       | Store/API  | By id or slug; include variants and images.          |
| Create product        | Admin      | Create product + at least one variant (SKU, size, stock). |
| Update product        | Admin      | Update name, description, price, slug, etc.          |
| Manage variants       | Admin      | Add/update/delete variants (SKU, size, stock, price).|
| Manage images         | Admin      | Add/update/delete ProductImage; set sortOrder/isPrimary. |
| Delete/deactivate     | Admin      | Remove or hide product (soft delete optional).       |

Store = public or logged-in customer. Admin = internal user with admin role.

---

## 2. Clean Architecture – Product in layers

Dependencies point **inward**: domain does not depend on Nest or Prisma; application depends only on domain and ports; infrastructure implements ports and exposes HTTP.

### 2.1 Domain layer (innermost)

**Responsibility:** Define what a product is and what contracts the application needs from the outside (ports). No framework or database details.

**Artifacts:**

- **Entity: Product**
  - Aggregate root for the product.
  - Holds: `id`, `name`, `slug`, `description`, `price`, `purchasePrice`, `imageUrl`, `categoryId`, `createdAt`, `updatedAt`.
  - Does **not** hold stock or SKU; those live in variants.
  - Enforces invariants (e.g. price > 0) in constructors or setters.
  - Pure TypeScript; no Nest decorators, no Prisma.

- **Entity: ProductVariant**
  - Belongs to a product; holds `id`, `productId`, `sku`, `size`, `stock`, `price`, `purchasePrice`, timestamps.
  - Enforces stock ≥ 0, optional price override > 0.

- **Entity: ProductImage**
  - Holds `id`, `productId`, `url`, `altText`, `sortOrder`, `isPrimary`.

- **Value objects (optional but recommended):**
  - **Money** – price with currency if needed.
  - **ProductId** – wrapped id for type safety.
  - **Slug** – URL-friendly identifier.
  - **Size** – enum (ONE, XS, S, M, L, XL, XXL).

- **Port: ProductRepository**
  - `findAll(): Promise<ProductEntity[]>`
  - `findById(id: string): Promise<ProductEntity | null>`
  - `findBySlug(slug: string): Promise<ProductEntity | null>`
  - `create(product: ProductEntity, variants: ProductVariantEntity[]): Promise<ProductEntity>`
  - `update(product: ProductEntity): Promise<ProductEntity>`
  - `delete(id: string): Promise<void>` (or soft delete)
  - Variant and image persistence can be part of the same port or separate ports (e.g. ProductVariantRepository, ProductImageRepository) depending on preferred granularity.

### 2.2 Application layer (use cases)

**Responsibility:** Orchestrate workflows and enforce application rules. Depends only on domain entities and ports.

**Use cases:**

| Use case                | Input                          | Output                    | Side effects / rules                    |
|--------------------------|--------------------------------|---------------------------|-----------------------------------------|
| ListProductsUseCase      | (filters optional)             | ProductEntity[]           | Read products (e.g. with variants/images). |
| GetProductUseCase        | id or slug                     | ProductEntity \| null     | Read by findById or findBySlug.         |
| CreateProductUseCase     | CreateProductInput + variants  | ProductEntity             | Validate; unique name/slug; create product + variants. |
| UpdateProductUseCase     | UpdateProductInput             | ProductEntity             | Validate; load; update.                 |
| CreateVariantUseCase    | CreateVariantInput             | ProductVariantEntity      | Unique SKU; create variant.              |
| UpdateVariantUseCase    | UpdateVariantInput             | ProductVariantEntity      | Update stock/price/SKU.                  |
| DeleteProductUseCase     | id                             | void                      | repository.delete(id).                   |

- **Inputs/outputs:** Plain DTOs or interfaces (e.g. `CreateProductInput`, `CreateVariantInput`). No HTTP or Prisma types here.
- **Validation:** Business rules (price > 0, stock ≥ 0, unique name/slug/SKU) in use cases or entities; duplicate checks via repository.

### 2.3 Infrastructure layer (adapters)

**Responsibility:** Implement ports and expose the product domain over HTTP and persistence.

**Artifacts:**

- **Adapter: PrismaProductRepository**
  - Implements ProductRepository (and optionally variant/image repositories).
  - Uses PrismaService; maps Prisma models to domain entities.
  - Writes to `Product`, `ProductVariant`, `ProductImage` tables.

- **HTTP: ProductController (store)**
  - `GET /api/products` – list products.
  - `GET /api/products/:id` or `GET /api/products/slug/:slug` – get one product with variants and images.

- **HTTP: Admin product controller**
  - `POST /api/admin/products` – create product + variants.
  - `PATCH /api/admin/products/:id` – update product.
  - `DELETE /api/admin/products/:id` – delete product.
  - Variant and image endpoints as needed (e.g. POST/PATCH variants, POST/DELETE images).

- **DTOs (HTTP)**
  - Request: CreateProductDto (name, slug, description, price, categoryId, imageUrl, variants[]), UpdateProductDto, CreateVariantDto, etc.
  - Response: ProductResponseDto (id, name, slug, description, price, imageUrl, categoryId, variants[], images[], timestamps).

### 2.4 Dependency flow (summary)

```
HTTP request
  → ProductController (infrastructure)
    → ListProductsUseCase / GetProductUseCase / CreateProductUseCase / … (application)
      → ProductRepositoryPort (interface)
        → PrismaProductRepository (infrastructure) → Prisma → PostgreSQL
```

---

## 3. Database: indexes and best practices

- **Product:** `@@unique([slug])`, `@@unique([name])`, `@@index([categoryId])` for listados and filters.
- **ProductVariant:** `@@unique([sku])`, `@@index([productId])` for joins and SKU lookups.
- **ProductImage:** `@@index([productId])` for loading gallery by product.
- **Integrity:** `onDelete: Restrict` on Category → Product; `onDelete: Cascade` on Product → ProductVariant and Product → ProductImage so deleting a product removes its variants and images.
- **Normalization:** No array columns for images; no duplicated product name/description per size. Single source of truth for SKU and stock per variant.

---

## 4. Mapping to current code (reference)

- **Domain:** `src/modules/catalog/domain/entities/product.entity.ts` (ProductEntity). Add ProductVariantEntity, ProductImageEntity; extend or add repository ports for variants/images.
- **Application:** `application/use-cases/list-products.use-case.ts`. Add GetProduct, CreateProduct, UpdateProduct, CreateVariant, UpdateVariant, DeleteProduct use cases and input types.
- **Infrastructure:** `infrastructure/persistence/prisma-product.repository.ts`; implement new methods and map Prisma `Product`, `ProductVariant`, `ProductImage` to domain entities. Controllers and DTOs as in section 2.3.

---

## 5. Next steps (implementation order)

1. **Domain:** Add ProductVariantEntity, ProductImageEntity, Size value object/enum; extend ProductRepository port with findBySlug, create (with variants), update, delete; optionally add variant/image ports.
2. **Application:** Add GetProductUseCase, CreateProductUseCase (with variants), UpdateProductUseCase, variant use cases, DeleteProductUseCase; define input DTOs and validation (unique name, slug, SKU; at least one variant).
3. **Infrastructure:** Implement new methods in PrismaProductRepository (including ProductVariant and ProductImage); add GET by id/slug, POST/PATCH/DELETE under `/api/admin/products` and variant/image endpoints; request/response DTOs and validation.
4. **Slug:** Implement slug generation (e.g. from name) and ensure uniqueness on create/update.

This keeps the Product domain aligned with business expectations, normalization, and Clean Architecture boundaries.
  