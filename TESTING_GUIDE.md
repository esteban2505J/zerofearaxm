# 🚀 Guía de Pruebas - ZeroFear E-Commerce API

## 📋 Requisitos Previos

- ✅ Docker y Docker Desktop corriendo
- ✅ Base de datos PostgreSQL iniciada (`docker-compose up -d`)
- ✅ Backend compilado (`pnpm build`)

---

## 🗄️ Base de Datos

### 1. Verificar que PostgreSQL está corriendo

```bash
docker ps
```

Deberías ver algo como:

```
CONTAINER ID   IMAGE              STATUS
xxxxx          postgres:15-alpine  Up 2 minutes
```

### 2. Ejecutar migraciones de Prisma

```bash
cd backend
pnpm prisma migrate dev
```

Esto:

- Crea las tablas en la BD
- Genera el cliente Prisma

---

## 🧪 Opciones de Prueba

### Opción 1: Ejecutar Tests E2E (Recomendado)

```bash
cd backend
pnpm test:e2e
```

**Esto ejecutará:**

- ✅ Creación de productos
- ✅ Búsqueda por ID
- ✅ Búsqueda por slug
- ✅ Actualización
- ✅ Eliminación
- ✅ Validaciones de errores
- ✅ Ciclo completo CRUD

**Resultado esperado:**

```
Products (e2e)
  POST /products (Create)
    ✓ should create a product with variants
    ✓ should fail when price is not provided
    ✓ should fail when name is not provided
  GET /products (Find All)
    ✓ should return all products
  GET /products/:id (Find by ID)
    ✓ should return a product by ID
    ✓ should return 404 when product not found
  GET /products/slug/:slug (Find by Slug)
    ✓ should return a product by slug
    ✓ should return 404 when slug not found
  PUT /products/:id (Update)
    ✓ should update a product
    ✓ should return 404 when updating non-existent product
  DELETE /products/:id (Delete)
    ✓ should delete a product
    ✓ should return 404 when deleting non-existent product
  Integration Tests
    ✓ should create, read, update and delete a product (full cycle)

13 passing (2s)
```

---

### Opción 2: Pruebas Manuales con Postman

#### Paso 1: Importar la Colección

1. Abre **Postman** (o descárgalo desde https://www.postman.com/downloads/)
2. Haz clic en **Import**
3. Arrastra el archivo: `ZeroFear_E-Commerce_API.postman_collection.json`
4. La colección se importará con todas las pruebas

#### Paso 2: Configurar Variables

En la colección, establece:

- `base_url`: `http://localhost:3000`
- `product_id`: Obtenido de la respuesta de crear un producto
- `product_slug`: Obtenido de la respuesta de crear un producto

#### Paso 3: Ejecutar Requests

1. **Create Product** (POST)
   - Body: Proporciona nombre, precio, categoryId
   - Response: Devuelve el producto con ID y slug

2. **Get All Products** (GET)
   - Sin parámetros
   - Response: Array de todos los productos

3. **Get by ID** (GET)
   - Parámetro: `{{product_id}}`
   - Response: Producto específico

4. **Get by Slug** (GET)
   - Parámetro: `{{product_slug}}`
   - Response: Producto por slug

5. **Update** (PUT)
   - Parámetro: `{{product_id}}`
   - Body: Cambios a aplicar
   - Response: Producto actualizado

6. **Delete** (DELETE)
   - Parámetro: `{{product_id}}`
   - Response: 204 No Content

---

### Opción 3: Pruebas con cURL

```bash
# 1. Crear producto
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 29.99,
    "categoryId": "cat-001"
  }'

# 2. Listar productos
curl http://localhost:3000/products

# 3. Obtener por ID
curl http://localhost:3000/products/{id}

# 4. Obtener por slug
curl http://localhost:3000/products/slug/test-product

# 5. Actualizar
curl -X PUT http://localhost:3000/products/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product",
    "price": 39.99
  }'

# 6. Eliminar
curl -X DELETE http://localhost:3000/products/{id}
```

---

### Opción 4: Interfaz Swagger (Interactiva)

1. Inicia el servidor:

   ```bash
   cd backend
   pnpm start:dev
   ```

2. Abre en el navegador:

   ```
   http://localhost:3000/api/docs
   ```

3. Verás una interfaz interactiva donde puedes:
   - Ver todos los endpoints
   - Ver request/response schemas
   - Probar directamente desde el navegador
   - Ver ejemplos de respuestas

---

## ✅ Checklist de Pruebas

- [ ] Base de datos PostgreSQL corriendo
- [ ] Migraciones ejecutadas
- [ ] Backend compilado sin errores
- [ ] Tests E2E pasando (13 pruebas)
- [ ] Swagger docs accesible
- [ ] Crear un producto con variantes
- [ ] Obtener todos los productos
- [ ] Obtener por ID
- [ ] Obtener por slug
- [ ] Actualizar producto
- [ ] Eliminar producto
- [ ] Validación de errores (404, 400)

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'uuid'"

```bash
# Ya está instalado, pero si falta:
cd backend
pnpm install
```

### Error: "Database connection refused"

```bash
# Reinicia Docker Desktop
# Verifica que PostgreSQL está corriendo:
docker ps
docker logs <container_id>
```

### Error: "Prisma Client not generated"

```bash
cd backend
pnpm prisma generate
```

### Tests fallan con errores de BD

```bash
# Limpia y recrea las migraciones
cd backend
pnpm prisma migrate reset
pnpm prisma migrate dev
```

---

## 📊 Metricas de Prueba

| Componente     | Pruebas | Estado |
| -------------- | ------- | ------ |
| Create Product | 3       | ✅     |
| Get All        | 1       | ✅     |
| Get by ID      | 2       | ✅     |
| Get by Slug    | 2       | ✅     |
| Update         | 2       | ✅     |
| Delete         | 2       | ✅     |
| Integration    | 1       | ✅     |
| **Total**      | **13**  | **✅** |

---

## 📚 Referencias

- [Documentación Swagger](http://localhost:3000/api/docs)
- [Archivo de Requests](./TEST_REQUESTS.md)
- [Postman Collection](./ZeroFear_E-Commerce_API.postman_collection.json)
- [E2E Tests](./backend/test/products.e2e-spec.ts)

---

## 🎯 Próximos Pasos

Después de las pruebas exitosas:

1. ✅ Implementar autenticación JWT
2. ✅ Agregar validaciones con class-validator
3. ✅ Crear módulo de categorías
4. ✅ Implementar paginación
5. ✅ Agregar filtros avanzados
