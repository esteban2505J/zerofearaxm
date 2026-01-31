import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/productVariant.entity';

/**
 * Port (interface) for Product persistence.
 * The domain defines the contract; infrastructure implements it (e.g. PrismaProductRepository).
 * No framework or DB details here — only domain entities.
 */
export interface IProductRepository {
    findAll(): Promise<Product[]>;

    findById(id: string): Promise<Product | null>;

    findBySlug(slug: string): Promise<Product | null>;

    create(product: Product, variants: ProductVariant[]): Promise<Product>;

    update(product: Product): Promise<Product>;

    delete(id: string): Promise<void>;
}
