/**
 * @fileoverview Implementación de infraestructura del repositorio de productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { pool } from "../db/database";
import { Product, IProduct, ProductName, SKU } from "../../01-domain/entity/Product";
import { IProductRepository } from "../../01-domain/repository/ProductRepository";
import { ProductQueries } from "../db/sqlQueries/ProductQueries";
import { StockStatus } from "../../00-constants/RoleTypes";
import { AuditLog } from "../../01-domain/entity/AuditLog";

export class ProductRepositoryImpl implements IProductRepository {
    /**
     * Crea un nuevo producto en la base de datos
     * @param product - Datos del producto
     * @returns Producto creado
     */
    async create(product: IProduct): Promise<Product> {
        const result = await pool.query(ProductQueries.create, [
            product.name, 
            product.description, 
            product.sku,
            product.price, 
            product.quantity,
            product.criticalStock,
            product.categoryId,
            product.locationId,
            product.supplierId,
            product.isActive
        ]);
        if (result.rows.length > 0) {
            return this.mapRowToProduct(result.rows[0]);
        }
        throw new Error('Error al crear producto');
    }

    /**
     * Busca un producto por ID
     * @param id - ID del producto
     * @returns Producto encontrado o null
     */
    async findById(id: number): Promise<Product | null> {
        const result = await pool.query(ProductQueries.findById, [id]);
        if (result.rows.length === 0) return null;
        return this.mapRowToProduct(result.rows[0]);
    }

    /**
     * Busca un producto por SKU (tipado semántico)
     * @param sku - SKU del producto
     * @returns Producto encontrado o null
     */
    async findBySku(sku: SKU | string): Promise<Product | null> {
        const result = await pool.query(ProductQueries.findBySku, [sku]);
        if (result.rows.length === 0) return null;
        return this.mapRowToProduct(result.rows[0]);
    }

    /**
     * Obtiene todos los productos
     * @returns Lista de productos
     */
    async findAll(): Promise<Product[]> {
        const result = await pool.query(ProductQueries.findAll);
        return result.rows.map(this.mapRowToProduct);
    }

    /**
     * Obtiene productos activos
     * @returns Lista de productos activos
     */
    async findActive(): Promise<Product[]> {
        const result = await pool.query(ProductQueries.findActive);
        return result.rows.map(this.mapRowToProduct);
    }

    /**
     * Busca productos por categoría
     * @param categoryId - ID de la categoría
     * @returns Lista de productos de la categoría
     */
    async findByCategory(categoryId: number): Promise<Product[]> {
        const result = await pool.query(ProductQueries.findByCategory, [categoryId]);
        return result.rows.map(this.mapRowToProduct);
    }

    /**
     * Busca productos por ubicación
     * @param locationId - ID de la ubicación
     * @returns Lista de productos en la ubicación
     */
    async findByLocation(locationId: number): Promise<Product[]> {
        const result = await pool.query(ProductQueries.findByLocation, [locationId]);
        return result.rows.map(this.mapRowToProduct);
    }

    /**
     * Busca productos por proveedor
     * @param supplierId - ID del proveedor
     * @returns Lista de productos del proveedor
     */
    async findBySupplier(supplierId: number): Promise<Product[]> {
        const result = await pool.query(ProductQueries.findBySupplier, [supplierId]);
        return result.rows.map(this.mapRowToProduct);
    }

    /**
     * Busca productos por estado de stock
     * @param status - Estado del stock
     * @returns Lista de productos con el estado especificado
     */
    async findByStockStatus(status: StockStatus): Promise<Product[]> {
        let query: string;
        switch (status) {
            case StockStatus.CRITICAL:
                query = ProductQueries.findCriticalStock;
                break;
            case StockStatus.OUT_OF_STOCK:
                query = ProductQueries.findOutOfStock;
                break;
            case StockStatus.NORMAL:
                query = ProductQueries.findNormalStock;
                break;
            default:
                return [];
        }
        const result = await pool.query(query);
        return result.rows.map(this.mapRowToProduct);
    }

    async findCriticalStock(): Promise<Product[]> {
        return this.findByStockStatus(StockStatus.CRITICAL);
    }

    async findOutOfStock(): Promise<Product[]> {
        return this.findByStockStatus(StockStatus.OUT_OF_STOCK);
    }

    /**
     * Busca productos por nombre (tipado semántico)
     * @param name - Nombre a buscar
     * @returns Lista de productos que coinciden
     */
    async searchByName(name: ProductName | string): Promise<Product[]> {
        const result = await pool.query(ProductQueries.searchByName, [`%${name}%`]);
        return result.rows.map(this.mapRowToProduct);
    }

    async update(id: number, productData: Partial<IProduct>): Promise<Product> {
        const existingProduct = await this.findById(id);
        if (!existingProduct) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }

        // Construir query dinámica basada en los campos proporcionados
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (productData.name !== undefined) {
            updateFields.push(`name = $${paramIndex++}`);
            values.push(productData.name);
        }
        if (productData.description !== undefined) {
            updateFields.push(`description = $${paramIndex++}`);
            values.push(productData.description);
        }
        if (productData.sku !== undefined) {
            updateFields.push(`sku = $${paramIndex++}`);
            values.push(productData.sku);
        }
        if (productData.price !== undefined) {
            updateFields.push(`price = $${paramIndex++}`);
            values.push(productData.price);
        }
        if (productData.quantity !== undefined) {
            updateFields.push(`quantity = $${paramIndex++}`);
            values.push(productData.quantity);
        }
        if (productData.criticalStock !== undefined) {
            updateFields.push(`critical_stock = $${paramIndex++}`);
            values.push(productData.criticalStock);
        }
        if (productData.categoryId !== undefined) {
            updateFields.push(`category_id = $${paramIndex++}`);
            values.push(productData.categoryId);
        }
        if (productData.locationId !== undefined) {
            updateFields.push(`location_id = $${paramIndex++}`);
            values.push(productData.locationId);
        }
        if (productData.supplierId !== undefined) {
            updateFields.push(`supplier_id = $${paramIndex++}`);
            values.push(productData.supplierId);
        }
        if (productData.isActive !== undefined) {
            updateFields.push(`is_active = $${paramIndex++}`);
            values.push(productData.isActive);
        }

        updateFields.push(`updated_at = NOW()`);
        values.push(id); // ID para WHERE clause

        const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
        
        await pool.query(query, values);

        // Retornar producto actualizado
        return await this.findById(id) as Product;
    }

    async delete(id: number): Promise<void> {
        const result = await pool.query(ProductQueries.delete, [id]);
        if (result.rowCount === 0) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }
    }

    async updateStock(id: number, quantity: number): Promise<Product> {
        const product = await this.findById(id);
        if (!product) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }

        return this.update(id, { quantity });
    }

    async addStock(id: number, quantity: number): Promise<Product> {
        const product = await this.findById(id);
        if (!product) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }

        const newQuantity = product.quantity + quantity;
        return this.update(id, { quantity: newQuantity });
    }

    async reduceStock(id: number, quantity: number): Promise<Product> {
        const product = await this.findById(id);
        if (!product) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }

        if (product.quantity < quantity) {
            throw new Error('Stock insuficiente para reducir');
        }

        const newQuantity = product.quantity - quantity;
        return this.update(id, { quantity: newQuantity });
    }

    /**
     * Verifica si existe un producto con el SKU dado (tipado semántico)
     * @param sku - SKU a verificar
     * @returns true si existe
     */
    async existsBySku(sku: SKU | string): Promise<boolean> {
        const result = await pool.query(ProductQueries.existsBySku, [sku]);
        return !!result.rows[0]?.exists;
    }

    async getInventoryStats(): Promise<{
        totalProducts: number;
        activeProducts: number;
        criticalStockCount: number;
        outOfStockCount: number;
        totalValue: number;
    }> {
        const result = await pool.query(ProductQueries.getInventoryStats);
        const stats = result.rows[0];
        
        return {
            totalProducts: parseInt(stats.total_products),
            activeProducts: parseInt(stats.active_products),
            criticalStockCount: parseInt(stats.critical_stock_count),
            outOfStockCount: parseInt(stats.out_of_stock_count),
            totalValue: parseFloat(stats.total_value)
        };
    }

    /**
     * Obtiene el historial de auditoría de un producto
     * @param productId - ID del producto
     * @returns Lista de logs de auditoría del producto
     */
    async getAuditTrail(productId: number): Promise<AuditLog<IProduct>[]> {
        const result = await pool.query(ProductQueries.getAuditTrail, [productId]);
        return result.rows.map((row: any) => new AuditLog<IProduct>(row));
    }

    // Métodos para usar las vistas SQL
    async getProductsFullInfo(): Promise<any[]> {
        const result = await pool.query('SELECT * FROM products_full_info');
        return result.rows;
    }

    async getCriticalStockProducts(): Promise<any[]> {
        const result = await pool.query('SELECT * FROM critical_stock_products');
        return result.rows;
    }

    // --- Método privado para mapear una fila de la BD a la entidad Product ---
    private mapRowToProduct(row: any): Product {
        return new Product({
            id: row.id,
            name: row.name,
            description: row.description,
            sku: row.sku,
            price: row.price,
            quantity: row.quantity,
            criticalStock: row.critical_stock,
            categoryId: row.category_id,
            locationId: row.location_id,
            supplierId: row.supplier_id,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }
}