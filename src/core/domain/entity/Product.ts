/**
 * @fileoverview Entidad de dominio para productos industriales
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { StockStatus } from '@shared/constants/RoleTypes';

/**
 * Tipos semánticos para mayor claridad y robustez
 */
type ProductName = string & { readonly brand: unique symbol };
type SKU = string & { readonly sku: unique symbol };

export type { ProductName, SKU };

/**
 * Interfaz para datos de producto alineada a la tabla 'products'
 */
export interface IProduct {
  id?: number;
  name: string;
  description?: string;
  sku: string;
  price: number;
  quantity: number;
  criticalStock: number; // corresponde a critical_stock en la BD
  categoryId: number;
  locationId?: number;
  supplierId?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entidad de dominio para productos industriales
 *
 * - Solo se puede modificar el estado mediante métodos de dominio.
 * - Validación centralizada y exhaustiva.
 * - Getters públicos para todos los campos relevantes.
 *
 * @class Product
 */
export class Product {
  private readonly _id?: number;
  private _name: ProductName;
  private _description?: string;
  private _sku: SKU;
  private _price: number;
  private _quantity: number;
  private _criticalStock: number;
  private _categoryId: number;
  private _locationId?: number;
  private _supplierId?: number;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  /**
   * Crea una nueva instancia de Product
   * @param data - Datos del producto
   * @throws {Error} Si los datos son inválidos
   */
  constructor(data: IProduct) {
    this.validateProductData(data);
    this._id = data.id;
    this._name = data.name as ProductName;
    this._description = data.description;
    this._sku = data.sku as SKU;
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

  // --- Getters públicos ---
  get id(): number | undefined {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | undefined {
    return this._description;
  }
  get sku(): string {
    return this._sku;
  }
  get price(): number {
    return this._price;
  }
  get quantity(): number {
    return this._quantity;
  }
  get criticalStock(): number {
    return this._criticalStock;
  }
  get categoryId(): number {
    return this._categoryId;
  }
  get locationId(): number | undefined {
    return this._locationId;
  }
  get supplierId(): number | undefined {
    return this._supplierId;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get createdAt(): Date | undefined {
    return this._createdAt;
  }
  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  /**
   * Devuelve el estado del stock del producto
   */
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

  /**
   * Indica si el producto está en stock crítico
   */
  public isCriticalStock(): boolean {
    return this._quantity <= this._criticalStock;
  }

  /**
   * Devuelve el valor total del inventario de este producto
   */
  public getInventoryValue(): number {
    return this._price * this._quantity;
  }

  // --- Métodos de dominio para cambios de estado ---

  /**
   * Incrementa la cantidad en inventario
   * @param amount - cantidad a incrementar
   */
  public increaseQuantity(amount: number): void {
    if (amount <= 0) throw new Error('El incremento debe ser positivo');
    this._quantity += amount;
    this.touchUpdatedAt();
  }

  /**
   * Disminuye la cantidad en inventario
   * @param amount - cantidad a disminuir
   */
  public decreaseQuantity(amount: number): void {
    if (amount <= 0) throw new Error('La disminución debe ser positiva');
    if (this._quantity - amount < 0) throw new Error('No hay suficiente stock');
    this._quantity -= amount;
    this.touchUpdatedAt();
  }

  /**
   * Actualiza el precio del producto
   * @param newPrice - nuevo precio
   */
  public updatePrice(newPrice: number): void {
    if (newPrice < 0) throw new Error('El precio no puede ser negativo');
    this._price = newPrice;
    this.touchUpdatedAt();
  }

  /**
   * Cambia el estado de activación del producto
   * @param active - nuevo estado
   */
  public setActive(active: boolean): void {
    this._isActive = active;
    this.touchUpdatedAt();
  }

  /**
   * Cambia la ubicación del producto
   * @param locationId - nueva ubicación
   */
  public changeLocation(locationId: number): void {
    if (locationId <= 0) throw new Error('ID de ubicación inválido');
    this._locationId = locationId;
    this.touchUpdatedAt();
  }

  /**
   * Cambia el proveedor del producto
   * @param supplierId - nuevo proveedor
   */
  public changeSupplier(supplierId: number): void {
    if (supplierId <= 0) throw new Error('ID de proveedor inválido');
    this._supplierId = supplierId;
    this.touchUpdatedAt();
  }

  /**
   * Cambia la categoría del producto
   * @param categoryId - nueva categoría
   */
  public changeCategory(categoryId: number): void {
    if (categoryId <= 0) throw new Error('ID de categoría inválido');
    this._categoryId = categoryId;
    this.touchUpdatedAt();
  }

  // --- Validación centralizada y granular ---
  private validateProductData(data: IProduct): void {
    this.validateName(data.name);
    this.validateDescription(data.description);
    this.validateSKU(data.sku);
    this.validatePrice(data.price);
    this.validateQuantity(data.quantity);
    this.validateCriticalStock(data.criticalStock);
    this.validateCategoryId(data.categoryId);
  }
  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error(
        'El nombre del producto debe tener al menos 2 caracteres'
      );
    }
    if (name.length > 255) {
      throw new Error('El nombre del producto no puede exceder 255 caracteres');
    }
  }
  private validateDescription(description?: string): void {
    if (description && description.length > 1000) {
      throw new Error('La descripción no puede exceder 1000 caracteres');
    }
  }
  private validateSKU(sku: string): void {
    if (!sku || sku.trim().length < 3) {
      throw new Error('El SKU debe tener al menos 3 caracteres');
    }
    if (sku.length > 50) {
      throw new Error('El SKU no puede exceder 50 caracteres');
    }
  }
  private validatePrice(price: number): void {
    if (price < 0) {
      throw new Error('El precio no puede ser negativo');
    }
    if (price > 9999999.99) {
      throw new Error('El precio no puede exceder 9,999,999.99');
    }
  }
  private validateQuantity(quantity: number): void {
    if (quantity < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }
  }
  private validateCriticalStock(criticalStock: number): void {
    if (criticalStock < 0) {
      throw new Error('El stock crítico no puede ser negativo');
    }
  }
  private validateCategoryId(categoryId: number): void {
    if (categoryId <= 0) {
      throw new Error('La categoría es obligatoria');
    }
  }

  /**
   * Actualiza la fecha de modificación
   * (solo para uso interno de la entidad)
   */
  private touchUpdatedAt(): void {
    this._updatedAt = new Date();
  }

  /**
   * Convierte la entidad a un objeto plano
   */
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
      updatedAt: this._updatedAt,
    };
  }
}
