/**
 * 
model ProductImage {
  id        String   @id @default(uuid())
  url       String
  altText   String?  // Accesibilidad y SEO
  sortOrder Int      @default(0) // Orden en galería
  isPrimary Boolean  @default(false) // Imagen principal

  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}

*/

export class ProductImage {
    constructor(
        public id: string,
        public url: string,
        public altText?: string,
        public sortOrder: number = 0,
        public isPrimary: boolean = false,
    ) { }
}