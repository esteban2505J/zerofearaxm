
import { ProductImage } from "./productImage.entity";
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
        public images: ProductImage[],
        public variants: ProductVariant[],
    ) {

        if (this.price <= 0) {
            throw new Error('Price must be greater than 0');
        }
    }

    // --- BUSINESS LOGIC (BEHAVIOR) ---

    // 1. Calculate total stock (Not saved in DB, calculated on the fly)
    get totalStock(): number {
        // Sum the stock of all variants
        return this.variants.reduce((acc, variant) => acc + variant.stock, 0);
    }

    // 2. Check availability
    hasStock(): boolean {
        return this.totalStock > 0;
    }

    // 3. Add variant safely
    addVariant(variant: ProductVariant): void {
        // Rule: No duplicate SKU
        const exists = this.variants.some(v => v.sku === variant.sku);
        if (exists) {
            throw new Error(`A variant with the SKU ${variant.sku} already exists`);
        }
        this.variants.push(variant);
    }
}