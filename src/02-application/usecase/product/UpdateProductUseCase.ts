import { Product } from "../../../01-domain/entity/Product";
import { ProductRepository } from "../../../01-domain/repository/ProductRepository";
import { UpdateProductDTO } from "../../dto/product/UpdateProductDTO";

export class UpdateProductUseCase {
    constructor(private productRepo: ProductRepository) { }

    async execute(id: number, data: UpdateProductDTO) {
        // Primero obtener el producto existente
        const existingProduct = await this.productRepo.findById(id);
        if (!existingProduct) {
            throw new Error(`Product with ID ${id} not found`);
        }

        // Actualizar solo los campos proporcionados
        if (data.name !== undefined) {
            existingProduct.setName(data.name);
        }
        if (data.description !== undefined) {
            existingProduct.setDescription(data.description);
        }
        if (data.price !== undefined) {
            existingProduct.setPrice(data.price);
        }
        if (data.quantity !== undefined) {
            existingProduct.setQuantity(data.quantity);
        }
        if (data.categoryId !== undefined) {
            existingProduct.setCategoryId(data.categoryId);
        }
        if (data.location !== undefined) {
            existingProduct.setLocation(data.location);
        }
        if (data.criticalStock !== undefined) {
            existingProduct.setCriticalStock(data.criticalStock);
        }
        if (data.isActive !== undefined) {
            existingProduct.setIsActive(data.isActive);
        }

        await this.productRepo.update(existingProduct);
    }
}