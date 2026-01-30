

/**
 * model Product {
  id          String   @id @default(uuid())
  name        String   @unique // Único en el catálogo
  slug        String   @unique // URLs amigables y SEO
  description String?
  price       Float    // Precio base; variantes pueden sobrescribir con price
  purchasePrice Float? // Costo de compra (opcional, para márgenes/analytics)
  imageUrl    String?  // Imagen principal (o primera de la galería)

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  variants    ProductVariant[]
  images      ProductImage[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])
  @@index([slug])
}
 */


import { ProductVariant } from "./productVariant.entity";

export class Product {

    constructor(
        public id: string,
        public name: string,
        public slug: string,
        public description: string | null,
        public price: number,
        public purchasePrice: number | null,
        public imageUrl: string | null,
        public categoryId: string,
        public variants: ProductVariant[],
    ) { }
}