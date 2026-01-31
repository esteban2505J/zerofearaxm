import { Product } from 'src/domain/entities/product.entity';
import { ProductVariant } from 'src/domain/entities/productVariant.entity';
import { ProductImage } from 'src/domain/entities/productImage.entity';
import { Category } from 'src/domain/entities/category.entity';
import { ProductSize } from 'src/domain/enums/productSize';

// Importamos los tipos generados por Prisma
import { 
  Product as PrismaProduct, 
  ProductVariant as PrismaVariant, 
  ProductImage as PrismaImage,
  Category as PrismaCategory
} from '@prisma/client';

/**
 * DEFINICIÓN DEL TIPO "FULL":
 * Prisma por defecto no trae las relaciones. 
 * Definimos este tipo para decirle a TypeScript: 
 * "Este es un producto que SÍ O SÍ trae sus variantes, imágenes y categoría".
 */
type PrismaProductFull = PrismaProduct & {
  variants: PrismaVariant[];
  images: PrismaImage[];
  category?: PrismaCategory | null; // Puede ser null si no se hizo el include o si la relación es opcional
};

export class ProductMapper {

  /**
   * 🟢 DE PRISMA (DB) -> A DOMINIO (Entidad)
   * Convierte los datos crudos de la base de datos en tus clases con lógica.
   */
  static toDomain(raw: PrismaProductFull): Product {
    
    // 1. Mapear Variantes (Hijos)
    const variants = raw.variants.map(v => new ProductVariant(
      v.id,
      v.sku,
      // Truco: Casteamos el string de la DB al Enum del Dominio.
      // Como 'S' === 'S', funciona perfecto.
      v.size as unknown as ProductSize, 
      v.stock,
      v.price ?? undefined, // Convertimos null a undefined
      v.purchasePrice ?? undefined
    ));

    // 2. Mapear Imágenes (Hijos)
    const images = raw.images.map(i => new ProductImage(
      i.id,
      i.url, // Prisma devuelve null, la entidad acepta string | null. Compatible.
    ));

    // 3. Mapear Categoría (Relación - Opcional)
    // Solo creamos la entidad Category si Prisma nos trajo datos (no es null)
    let category: Category | undefined = undefined;
    if (raw.category) {
      category = new Category(
        raw.category.id,
        raw.category.name,
        // createdAt/updatedAt se omiten si no los necesitas en la lógica
      );
    }

    // 4. Crear el Producto (Agregado Raíz)
    return new Product(
      raw.id,
      raw.name,
      raw.slug,
      raw.description,
      raw.price,          // Ojo: Si usaras Decimal en Prisma, aquí iría Number(raw.price)
      raw.purchasePrice,
      raw.imageUrl,
      raw.categoryId,     // El ID obligatorio (Foreign Key)
      images,             // Array de Entidades
      variants         // Array de Entidade            // Entidad Opcional
    );
  }

  /**
   * 🟠 DE DOMINIO (Entidad) -> A PRISMA (DB)
   * Prepara los datos PLANOS del producto para ser guardados.
   * * NOTA IMPORTANTE:
   * Aquí NO devolvemos 'variants' ni 'images'. 
   * ¿Por qué? Porque Prisma maneja la creación de relaciones anidadas 
   * de forma especial (nested writes) en el repositorio, no aquí.
   */
  static toPersistence(product: Product) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      purchasePrice: product.purchasePrice,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      // createdAt y updatedAt los maneja Prisma automáticamente (@default(now))
    };
  }
}