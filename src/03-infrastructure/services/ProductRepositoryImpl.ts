import { pool } from "../db/database";
import { Product, IProduct } from "../../01-domain/entity/Product";
import { IProductRepository } from "../../01-domain/repository/ProductRepository";
import { ProductQueries } from "../db/sqlQueries/ProductQueries";
import { StockStatus } from "../../00-constants/RoleTypes";

export class ProductRepositoryImpl implements IProductRepository {
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
        
        // Asignar el ID generado por la base de datos
        if (result.rows.length > 0) {
            const createdProduct = new Product({
                id: result.rows[0].id,
                name: product.name,
                description: product.description,
                sku: product.sku,
                price: product.price,
                quantity: product.quantity,
                criticalStock: product.criticalStock,
                categoryId: product.categoryId,
                locationId: product.locationId,
                supplierId: product.supplierId,
                isActive: product.isActive,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return createdProduct;
        }
        
        throw new Error('Error al crear producto');
    }

    async findById(id: number): Promise<Product | null> {
        const result = await pool.query(ProductQueries.findById, [id]);
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
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

    async findBySku(sku: string): Promise<Product | null> {
        const result = await pool.query(ProductQueries.findBySku, [sku]);
        if (result.rows.length === 0) return null;
        
        const row = result.rows[0];
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

    async findAll(): Promise<Product[]> {
        const result = await pool.query(ProductQueries.findAll);
        return result.rows.map(row => new Product({
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
        }));
    }

    async findActive(): Promise<Product[]> {
        const result = await pool.query(ProductQueries.findActive);
        return result.rows.map(row => new Product({
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
        }));
    }

    async findByCategory(categoryId: number): Promise<Product[]> {
        const result = await pool.query(ProductQueries.findByCategory, [categoryId]);
        return result.rows.map(row => new Product({
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
        }));
    }

    async findByLocation(locationId: number): Promise<Product[]> {
        const result = await pool.query(ProductQueries.findByLocation, [locationId]);
        return result.rows.map(row => new Product({
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
        }));
    }

    async findBySupplier(supplierId: number): Promise<Product[]> {
        const result = await pool.query(ProductQueries.findBySupplier, [supplierId]);
        return result.rows.map(row => new Product({
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
        }));
    }

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
        return result.rows.map(row => new Product({
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
        }));
    }

    async findCriticalStock(): Promise<Product[]> {
        return this.findByStockStatus(StockStatus.CRITICAL);
    }

    async findOutOfStock(): Promise<Product[]> {
        return this.findByStockStatus(StockStatus.OUT_OF_STOCK);
    }

    async searchByName(name: string): Promise<Product[]> {
        const result = await pool.query(ProductQueries.searchByName, [`%${name}%`]);
        return result.rows.map(row => new Product({
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
        }));
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

        const newQuantity = product.getQuantity() + quantity;
        return this.update(id, { quantity: newQuantity });
    }

    async reduceStock(id: number, quantity: number): Promise<Product> {
        const product = await this.findById(id);
        if (!product) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }

        if (product.getQuantity() < quantity) {
            throw new Error('Stock insuficiente para reducir');
        }

        const newQuantity = product.getQuantity() - quantity;
        return this.update(id, { quantity: newQuantity });
    }

    async existsBySku(sku: string): Promise<boolean> {
        const product = await this.findBySku(sku);
        return product !== null;
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

    async getAuditTrail(productId: number): Promise<any[]> {
        const result = await pool.query(ProductQueries.getAuditTrail, [productId]);
        return result.rows;
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
}