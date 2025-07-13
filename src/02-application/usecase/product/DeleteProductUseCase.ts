import { ProductRepository } from "../../../01-domain/repository/ProductRepository";

export class DeleteProductUseCase {
    constructor(private productRepo: ProductRepository) { }

    async execute(id: number) {
        await this.productRepo.delete(id);
    }
}