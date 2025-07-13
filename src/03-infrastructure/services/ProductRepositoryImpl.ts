import { pool } from "../db/database";
import { Product } from "../../01-domain/entity/Product";
import { ProductRepository } from "../../01-domain/repository/ProductRepository";
import { ProductQueries } from "../db/sqlQueries/ProductQueries";

export class ProductRepositoryImpl implements ProductRepository {
    async create(product: Product): Promise<void> {
        await pool.query(ProductQueries.create, [product.getName(), product.getDescription(), product.getPrice(), product.getQuantity()]);
    }

    async update(product: Product): Promise<void> {
        await pool.query(ProductQueries.update, [product.getName(), product.getDescription(), product.getPrice(), product.getQuantity(), product.getId()]);
    }

    async delete(productId: number): Promise<void> {
        await pool.query(ProductQueries.delete, [productId]);
    }

    async findById(productId: number): Promise<Product | null> {
        const result = await pool.query(ProductQueries.findById, [productId]);
        if (result.rows.length === 0) return null;
        const row = result.rows[0];
        return new Product(row.id, row.name, row.description, row.price, row.quantity);
    }

    async findAll(): Promise<Product[]> {
        const result = await pool.query(ProductQueries.findAll);
        return result.rows.map(row => new Product(row.id, row.name, row.description, row.price, row.quantity));
    }
}