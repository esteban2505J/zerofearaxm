/**

 * model ProductVariant {
  id            String   @id @default(uuid())
  sku           String   @unique // Identificador único para inventario e integraciones
  size          Size
  stock         Int      @default(0)
  price         Float?   // Si null, usar Product.price
  purchasePrice Float?   // Costo por variante (opcional)

  productId     String
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([productId])
  @@index([sku])
}
 */

export class ProductVariant {
    constructor(
        public id: string,
        public sku: string,
        public size: string,
        public stock: number,
        public price?: number,
        public purchasePrice?: number,
    ) { }
}