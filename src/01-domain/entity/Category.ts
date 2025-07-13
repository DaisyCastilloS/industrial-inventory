/**
 * @fileoverview Entidad de dominio para categorías de productos
 * @author Industrial Inventory System
 * @version 1.0.0
 */

/**
 * Interfaz para datos de categoría
 */
export interface ICategory {
  id?: number;
  name: string;
  description?: string;
  parentId?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entidad de dominio para categorías
 * @class Category
 */
export class Category {
  private readonly _id?: number;
  private _name: string;
  private _description?: string;
  private _parentId?: number;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(data: ICategory) {
    this.validateCategoryData(data);
    this._id = data.id;
    this._name = data.name;
    this._description = data.description;
    this._parentId = data.parentId;
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  // Getters solo lectura
  get id(): number | undefined { return this._id; }
  get name(): string { return this._name; }
  get description(): string | undefined { return this._description; }
  get parentId(): number | undefined { return this._parentId; }
  get isActive(): boolean { return this._isActive; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  // Métodos de dominio
  public updateName(newName: string): void {
    if (!newName || newName.trim().length < 2) throw new Error('El nombre debe tener al menos 2 caracteres');
    this._name = newName;
    this._updatedAt = new Date();
  }

  public updateDescription(newDescription: string): void {
    if (newDescription && newDescription.length > 1000) throw new Error('La descripción no puede exceder 1000 caracteres');
    this._description = newDescription;
    this._updatedAt = new Date();
  }

  public setParent(parentId: number | undefined): void {
    if (parentId !== undefined && parentId <= 0) throw new Error('ID de categoría padre inválido');
    this._parentId = parentId;
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

  // Validaciones centralizadas
  private validateCategoryData(data: ICategory): void {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('El nombre de la categoría debe tener al menos 2 caracteres');
    }
    if (data.name.length > 255) {
      throw new Error('El nombre de la categoría no puede exceder 255 caracteres');
    }
    if (data.description && data.description.length > 1000) {
      throw new Error('La descripción no puede exceder 1000 caracteres');
    }
    if (data.parentId !== undefined && data.parentId <= 0) {
      throw new Error('ID de categoría padre inválido');
    }
  }

  public toJSON(): ICategory {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      parentId: this._parentId,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
} 