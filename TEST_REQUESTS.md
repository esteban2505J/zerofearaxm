# ZeroFear E-Commerce API - Test Requests

## Base URL

```
http://localhost:3000
```

## Swagger Documentation

```
http://localhost:3000/api/docs
```

---

## 1. CREATE PRODUCT - POST /products

**Request:**

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Polo Shirt Premium",
    "description": "High quality polo shirt made from 100% cotton",
    "price": 49.99,
    "purchasePrice": 20.0,
    "categoryId": "cat-001",
    "imageUrl": "https://example.com/polo-shirt.jpg",
    "variants": [
      {
        "sku": "POLO-001-XS",
        "size": "XS",
        "stock": 10,
        "price": 49.99
      },
      {
        "sku": "POLO-001-S",
        "size": "S",
        "stock": 15,
        "price": 49.99
      },
      {
        "sku": "POLO-001-M",
        "size": "M",
        "stock": 20,
        "price": 49.99
      },
      {
        "sku": "POLO-001-L",
        "size": "L",
        "stock": 18,
        "price": 49.99
      }
    ]
  }'
```

**Expected Response (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Polo Shirt Premium",
  "slug": "polo-shirt-premium",
  "description": "High quality polo shirt made from 100% cotton",
  "price": 49.99,
  "purchasePrice": 20.0,
  "imageUrl": "https://example.com/polo-shirt.jpg",
  "categoryId": "cat-001",
  "images": [],
  "variants": [
    {
      "id": "variant-id-1",
      "sku": "POLO-001-XS",
      "size": "XS",
      "stock": 10,
      "price": 49.99
    },
    {
      "id": "variant-id-2",
      "sku": "POLO-001-S",
      "size": "S",
      "stock": 15,
      "price": 49.99
    },
    {
      "id": "variant-id-3",
      "sku": "POLO-001-M",
      "size": "M",
      "stock": 20,
      "price": 49.99
    },
    {
      "id": "variant-id-4",
      "sku": "POLO-001-L",
      "size": "L",
      "stock": 18,
      "price": 49.99
    }
  ],
  "totalStock": 63
}
```

---

## 2. GET ALL PRODUCTS - GET /products

**Request:**

```bash
curl -X GET http://localhost:3000/products
```

**Expected Response (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Polo Shirt Premium",
    "slug": "polo-shirt-premium",
    "price": 49.99,
    "variants": [...],
    "images": []
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "T-Shirt Classic",
    "slug": "t-shirt-classic",
    "price": 29.99,
    "variants": [...],
    "images": []
  }
]
```

---

## 3. GET PRODUCT BY ID - GET /products/:id

**Request:**

```bash
curl -X GET http://localhost:3000/products/550e8400-e29b-41d4-a716-446655440000
```

**Expected Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Polo Shirt Premium",
  "slug": "polo-shirt-premium",
  "description": "High quality polo shirt",
  "price": 49.99,
  "purchasePrice": 20.0,
  "imageUrl": "https://example.com/polo-shirt.jpg",
  "categoryId": "cat-001",
  "variants": [...],
  "images": [],
  "totalStock": 63
}
```

**Error Response (404 Not Found):**

```json
{
  "statusCode": 404,
  "message": "Product with ID invalid-id not found"
}
```

---

## 4. GET PRODUCT BY SLUG - GET /products/slug/:slug

**Request:**

```bash
curl -X GET http://localhost:3000/products/slug/polo-shirt-premium
```

**Expected Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Polo Shirt Premium",
  "slug": "polo-shirt-premium",
  "price": 49.99,
  "variants": [...],
  "images": []
}
```

---

## 5. UPDATE PRODUCT - PUT /products/:id

**Request:**

```bash
curl -X PUT http://localhost:3000/products/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Polo Shirt Premium V2",
    "description": "Updated description",
    "price": 59.99
  }'
```

**Expected Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Polo Shirt Premium V2",
  "slug": "polo-shirt-premium-v2",
  "price": 59.99,
  "description": "Updated description",
  "variants": [...],
  "images": [],
  "totalStock": 63
}
```

---

## 6. DELETE PRODUCT - DELETE /products/:id

**Request:**

```bash
curl -X DELETE http://localhost:3000/products/550e8400-e29b-41d4-a716-446655440000
```

**Expected Response (204 No Content):**

```
(No body)
```

**Error Response (404 Not Found):**

```json
{
  "statusCode": 404,
  "message": "Product with ID invalid-id not found"
}
```

---

## Running the Tests

### E2E Tests (Jest)

```bash
cd backend
pnpm test:e2e
```

### Unit Tests

```bash
pnpm test
```

### Watch Mode

```bash
pnpm test:watch
```

### Coverage Report

```bash
pnpm test:cov
```

---

## Test Scenarios

### Scenario 1: Product Validation

- ✅ Create product with all fields
- ✅ Create product with minimal fields (name, price, categoryId)
- ❌ Create product without name (should fail)
- ❌ Create product with price <= 0 (should fail)

### Scenario 2: Variants Management

- ✅ Create product with multiple variants
- ✅ Verify totalStock calculation
- ✅ Check variant SKU uniqueness
- ❌ Create duplicate SKU (should fail)

### Scenario 3: CRUD Operations

- ✅ Create → Read → Update → Delete
- ✅ Verify slug generation
- ✅ Check timestamp management (createdAt, updatedAt)

### Scenario 4: Error Handling

- ✅ 404 for non-existent ID
- ✅ 404 for non-existent slug
- ✅ 400 for invalid input
- ✅ Proper error messages

---

## Notes

1. **Slug Generation**: Automatically generated from product name
   - Example: "Polo Shirt Premium" → "polo-shirt-premium"

2. **UUID Generation**: All IDs are auto-generated UUIDs
   - Format: `550e8400-e29b-41d4-a716-446655440000`

3. **Price Validation**: Price must be > 0

4. **Database**: Using PostgreSQL with Prisma ORM

5. **Documentation**: Interactive API docs available at `/api/docs`
