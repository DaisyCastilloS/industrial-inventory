import { Product } from "../../../01-domain/entity/Product";
import { ProductRepository } from "../../../01-domain/repository/ProductRepository";

export class CreateProductUseCase {
    constructor(private productRepo: ProductRepository) { }

    async execute(data: { 
        name: string; 
        description: string; 
        price: number; 
        quantity: number;
        categoryId: number;
        location: string;
        criticalStock: number;
        isActive?: boolean;
    }) {
        const product = new Product(
            0, 
            data.name, 
            data.description, 
            data.price, 
            data.quantity,
            data.categoryId,
            data.location,
            data.criticalStock,
            data.isActive ?? true
        );
        await this.productRepo.create(product);
    }
}
