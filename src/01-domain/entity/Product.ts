/**
 * @fileoverview Entidad de dominio para productos industriales
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { StockStatus } from '../../00-constants/RoleTypes';

/**
 * Interfaz para datos de producto
 */
export interface IProduct {
  id?: number;
  name: string;
  description?: string;
  sku: string;
  price: number;
  quantity: number;
  criticalStock: number;
  categoryId: number;
  locationId?: number;
  supplierId?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entidad de dominio para productos
 * @class Product
 */
export class Product {
  private readonly _id?: number;
  private _name: string;
  private _description?: string;
  private _sku: string;
  private _price: number;
  private _quantity: number;
  private _criticalStock: number;
  private _categoryId: number;
  private _locationId?: number;
  private _supplierId?: number;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(data: IProduct) {
    this.validateProductData(data);
    this._id = data.id;
    this._name = data.name;
    this._description = data.description;
    this._sku = data.sku;
    this._price = data.price;
    this._quantity = data.quantity;
    this._criticalStock = data.criticalStock;
    this._categoryId = data.categoryId;
    this._locationId = data.locationId;
    this._supplierId = data.supplierId;
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  // Getters solo lectura
  get id(): number | undefined { return this._id; }
  get name(): string { return this._name; }
  get description(): string | undefined { return this._description; }
  get sku(): string { return this._sku; }
  get price(): number { return this._price; }
  get quantity(): number { return this._quantity; }
  get criticalStock(): number { return this._criticalStock; }
  get categoryId(): number { return this._categoryId; }
  get locationId(): number | undefined { return this._locationId; }
  get supplierId(): number | undefined { return this._supplierId; }
  get isActive(): boolean { return this._isActive; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  // Métodos de dominio
  public addStock(quantity: number): void {
    if (quantity <= 0) throw new Error('La cantidad debe ser mayor a 0');
    this._quantity += quantity;
    this._updatedAt = new Date();
  }

  public reduceStock(quantity: number): void {
    if (quantity <= 0) throw new Error('La cantidad debe ser mayor a 0');
    if (quantity > this._quantity) throw new Error('Stock insuficiente');
    this._quantity -= quantity;
    this._updatedAt = new Date();
  }

  public adjustStock(newQuantity: number): void {
    if (newQuantity < 0) throw new Error('La cantidad no puede ser negativa');
    this._quantity = newQuantity;
    this._updatedAt = new Date();
  }

  public updatePrice(newPrice: number): void {
    if (newPrice < 0) throw new Error('El precio no puede ser negativo');
    if (newPrice > 9999999.99) throw new Error('El precio no puede exceder 9,999,999.99');
    this._price = newPrice;
    this._updatedAt = new Date();
  }

  public updateCriticalStock(newCriticalStock: number): void {
    if (newCriticalStock < 0) throw new Error('El stock crítico no puede ser negativo');
    this._criticalStock = newCriticalStock;
    this._updatedAt = new Date();
  }

  public activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  public getStockStatus(): StockStatus {
    switch (true) {
      case this._quantity === 0:
        return StockStatus.OUT_OF_STOCK;
      case this._quantity <= this._criticalStock:
        return StockStatus.CRITICAL;
      default:
        return StockStatus.NORMAL;
    }
  }

  public getInventoryValue(): number {
    return this._price * this._quantity;
  }

  // Validaciones centralizadas
  private validateProductData(data: IProduct): void {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('El nombre del producto debe tener al menos 2 caracteres');
    }
    if (data.name.length > 255) {
      throw new Error('El nombre del producto no puede exceder 255 caracteres');
    }
    if (data.description && data.description.length > 1000) {
      throw new Error('La descripción no puede exceder 1000 caracteres');
    }
    if (!data.sku || data.sku.trim().length < 3) {
      throw new Error('El SKU debe tener al menos 3 caracteres');
    }
    if (data.sku.length > 50) {
      throw new Error('El SKU no puede exceder 50 caracteres');
    }
    if (data.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }
    if (data.price > 9999999.99) {
      throw new Error('El precio no puede exceder 9,999,999.99');
    }
    if (data.quantity < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }
    if (data.criticalStock < 0) {
      throw new Error('El stock crítico no puede ser negativo');
    }
    if (data.categoryId <= 0) {
      throw new Error('La categoría es obligatoria');
    }
  }

  public toJSON(): IProduct {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      sku: this._sku,
      price: this._price,
      quantity: this._quantity,
      criticalStock: this._criticalStock,
      categoryId: this._categoryId,
      locationId: this._locationId,
      supplierId: this._supplierId,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}