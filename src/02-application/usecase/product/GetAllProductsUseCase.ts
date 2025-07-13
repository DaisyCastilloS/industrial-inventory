import { ProductRepository } from "../../../01-domain/repository/ProductRepository";

export class GetAllProductsUseCase {
    constructor(private productRepo: ProductRepository) { }

    async execute() {
        return this.productRepo.findAll();
    }
}