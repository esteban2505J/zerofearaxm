import { PrismaClient,Size } from '@prisma/client'; // O tu PrismaService si usas NestJS
import { IProductRepository } from 'src/domain/repositories/product.repository.interface'; // Tu interfaz
import { Product } from '../../domain/entities/product.entity';
import { ProductVariant } from 'src/domain/entities/productVariant.entity';
import { ProductMapper } from '../mappers/product.mapper';
// 1. IMPORTA ESTO DE PRISMA

// Si usas NestJS, añade @Injectable() aquí
export class PrismaProductRepository implements IProductRepository {
  
  // Inyectamos el cliente de Prisma
  constructor(private readonly prisma: PrismaClient) {}

  // --------------------------------------------------------
  // 1. OBTENER TODOS
  // --------------------------------------------------------
  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      // ¡IMPORTANTE! Traemos las relaciones para poder armar la entidad completa
      include: {
        variants: true,
        images: true,
        category: true, // Si decidiste poner la relación opcional
      },
    });

    // Convertimos cada resultado de Prisma (JSON) a una Entidad de Dominio (Clase)
    return products.map((product) => ProductMapper.toDomain(product));
  }

  // --------------------------------------------------------
  // 2. BUSCAR POR ID
  // --------------------------------------------------------
  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: true,
        category: true,
      },
    });

    if (!product) return null;

    return ProductMapper.toDomain(product);
  }

  // --------------------------------------------------------
  // 3. BUSCAR POR SLUG (Para URLs amigables)
  // --------------------------------------------------------
  async findBySlug(slug: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
        images: true,
        category: true,
      },
    });

    if (!product) return null;

    return ProductMapper.toDomain(product);
  }

  // --------------------------------------------------------
  // 4. CREAR (Guardar nuevo producto y sus relaciones)
  // --------------------------------------------------------
  async create(product: Product): Promise<Product> {
    // Nota: Aunque tu interfaz dice (product, variants), 
    // en DDD el 'product' ya debería contener sus variantes dentro.
    // Usaremos 'product' como la fuente de verdad.

    // 1. Preparamos los datos planos del producto
    const data = ProductMapper.toPersistence(product);

    // 2. Transacción de Prisma: Crea Producto + Variantes + Imágenes de una vez
   const savedProduct = await this.prisma.product.create({
      data: {
        ...data,
        variants: {
          create: product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            
            // 2. AQUÍ ESTÁ EL ARREGLO:
            // Le decimos: "Trata este v.size (Domain) como si fuera un Size (Prisma)"
            size: v.size as Size, 
            
            stock: v.stock,
            price: v.price,
            purchasePrice: v.purchasePrice
          })),
        },
        images: {
          create: product.images.map((i) => ({
            id: i.id,
            url: i.url,
            altText: i.altText,
            isPrimary: i.isPrimary,
            sortOrder: i.sortOrder,
          })),
        },
      },
      include: {
        variants: true,
        images: true,
        category: true, // Si es opcional
      },
    });

    return ProductMapper.toDomain(savedProduct);
  }

  // --------------------------------------------------------
  // 5. ACTUALIZAR
  // --------------------------------------------------------
  async update(product: Product): Promise<Product> {
    const data = ProductMapper.toPersistence(product);

    // Actualizamos solo los campos escalares del producto
    // NOTA: Actualizar variantes anidadas es complejo (ver explicación abajo)
    const updatedProduct = await this.prisma.product.update({
      where: { id: product.id },
      data: {
        ...data,
        // Aquí podrías manejar lógica para actualizar variantes si cambiaron
      },
      include: {
        variants: true,
        images: true,
        category: true,
      },
    });

    return ProductMapper.toDomain(updatedProduct);
  }

  // --------------------------------------------------------
  // 6. ELIMINAR
  // --------------------------------------------------------
  async delete(id: string): Promise<void> {
    // Al tener 'onDelete: Cascade' en el schema.prisma, 
    // esto borrará también las variantes e imágenes automáticamente.
    await this.prisma.product.delete({
      where: { id },
    });
  }
}