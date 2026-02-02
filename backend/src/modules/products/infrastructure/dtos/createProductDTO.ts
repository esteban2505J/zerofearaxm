export class CreateProductDto {
    name: string;
    description: string;
    price: number;
    purchasePrice: number;
    categoryId: string;
    imageUrl: string;
    // Podrías recibir variantes iniciales aquí si quieres
    variants?: {
        sku: string;
        size: string;
        stock: number;
    }[];
}


