import { StockStatus } from '../../../shared/constants/RoleTypes';
import { BaseEntity, IBaseEntity } from './base/BaseEntity';

type ProductName = string & { readonly brand: unique symbol };
type SKU = string & { readonly sku: unique symbol };

export type { ProductName, SKU };

export interface IProduct extends IBaseEntity {
  name: string;
  description?: string;
  sku: string;
  price: number;
  quantity: number;
  criticalStock: number;
  categoryId: number;
  locationId?: number;
  supplierId?: number;
}

export class Product extends BaseEntity {
  private _name: ProductName;
  private _description?: string;
  private _sku: SKU;
  private _price: number;
  private _quantity: number;
  private _criticalStock: number;
  private _categoryId: number;
  private _locationId?: number;
  private _supplierId?: number;

  constructor(data: IProduct) {
    super(data);
    this.validateProductData(data);
    this._name = data.name as ProductName;
    this._description = data.description;
    this._sku = data.sku as SKU;
    this._price = data.price;
    this._quantity = data.quantity;
    this._criticalStock = data.criticalStock;
    this._categoryId = data.categoryId;
    this._locationId = data.locationId;
    this._supplierId = data.supplierId;
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

  public isCriticalStock(): boolean {
    return this._quantity <= this._criticalStock;
  }

  public getInventoryValue(): number {
    return this._price * this._quantity;
  }

  public increaseQuantity(amount: number): void {
    if (amount <= 0) throw new Error('El incremento debe ser positivo');
    this._quantity += amount;
    this.touch();
  }

  public decreaseQuantity(amount: number): void {
    if (amount <= 0) throw new Error('La disminución debe ser positiva');
    if (this._quantity - amount < 0) throw new Error('No hay suficiente stock');
    this._quantity -= amount;
    this.touch();
  }

  public updatePrice(newPrice: number): void {
    if (newPrice < 0) throw new Error('El precio no puede ser negativo');
    this._price = newPrice;
    this.touch();
  }

  public changeLocation(locationId: number): void {
    if (locationId <= 0) throw new Error('ID de ubicación inválido');
    this._locationId = locationId;
    this.touch();
  }

  public changeSupplier(supplierId: number): void {
    if (supplierId <= 0) throw new Error('ID de proveedor inválido');
    this._supplierId = supplierId;
    this.touch();
  }

  public changeCategory(categoryId: number): void {
    if (categoryId <= 0) throw new Error('ID de categoría inválido');
    this._categoryId = categoryId;
    this.touch();
  }

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
  }

  private validatePrice(price: number): void {
    if (price < 0) {
      throw new Error('El precio no puede ser negativo');
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
    if (!categoryId || categoryId <= 0) {
      throw new Error('La categoría es requerida y debe ser un ID válido');
    }
  }

  public toJSON(): IProduct {
    return {
      ...super.toJSON(),
      name: this._name,
      description: this._description,
      sku: this._sku,
      price: this._price,
      quantity: this._quantity,
      criticalStock: this._criticalStock,
      categoryId: this._categoryId,
      locationId: this._locationId,
      supplierId: this._supplierId,
    };
  }
}
