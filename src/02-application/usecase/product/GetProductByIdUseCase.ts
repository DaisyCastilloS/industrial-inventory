import { ProductRepository } from "../../../01-domain/repository/ProductRepository";

export class GetProductByIdUseCase {
    constructor(private productRepo: ProductRepository) { }

    async execute(id: number) {
        return this.productRepo.findById(id);
    }
}