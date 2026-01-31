/**
 * Value Object: ProductSize
 * - Immutable; equality by value.
 * - Restricts size to catalog values (ONE = no size, e.g. supplements; rest = t-shirt sizes).
 */

export const PRODUCT_SIZES = ['ONE', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export type ProductSizeValue = (typeof PRODUCT_SIZES)[number];

export class ProductSize {
    private readonly _value: ProductSizeValue;

    private constructor(value: ProductSizeValue) {
        this._value = value;
    }

    get value(): ProductSizeValue {
        return this._value;
    }

    static from(value: string): ProductSize {
        const normalized = value.toUpperCase().trim();
        if (!isValidSize(normalized)) {
            throw new Error(`Invalid product size: "${value}". Allowed: ${PRODUCT_SIZES.join(', ')}`);
        }
        return new ProductSize(normalized as ProductSizeValue);
    }

    static ONE = new ProductSize('ONE');
    static XS = new ProductSize('XS');
    static S = new ProductSize('S');
    static M = new ProductSize('M');
    static L = new ProductSize('L');
    static XL = new ProductSize('XL');
    static XXL = new ProductSize('XXL');

    equals(other: ProductSize): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}

function isValidSize(value: string): value is ProductSizeValue {
    return PRODUCT_SIZES.includes(value as ProductSizeValue);
}
