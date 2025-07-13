import { Product } from "../entity/Product";

export interface ProductRepository {
    create(product: Product): Promise<void>;
    update(product: Product): Promise<void>;
    delete(productId: number): Promise<void>;
    findById(productId: number): Promise<Product | null>;
    findAll(): Promise<Product[]>;
}
