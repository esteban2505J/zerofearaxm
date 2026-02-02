export class ProductImage {
    constructor(
        public id: string,
        public url: string,
        public altText?: string,
        public sortOrder: number = 0,
        public isPrimary: boolean = false,
    ) { }
}