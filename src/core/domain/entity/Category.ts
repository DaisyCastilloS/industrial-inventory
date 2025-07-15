/**
 * @fileoverview Entidad de dominio para categorías de productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

/**
 * Tipos semánticos para mayor claridad y robustez
 */
type CategoryName = string & { readonly category: unique symbol };

export type { CategoryName };

/**
 * Interfaz para datos de categoría alineada a la tabla 'categories'
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
 * Entidad de dominio para categorías de productos
 *
 * - Solo se puede modificar el estado mediante métodos de dominio.
 * - Validación centralizada y exhaustiva.
 * - Getters públicos para todos los campos relevantes.
 *
 * @class Category
 */
export class Category {
  private readonly _id?: number;
  private _name: CategoryName;
  private _description?: string;
  private _parentId?: number;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  /**
   * Crea una nueva instancia de Category
   * @param data - Datos de la categoría
   * @throws {Error} Si los datos son inválidos
   */
  constructor(data: ICategory) {
    this.validateCategoryData(data);
    this._id = data.id;
    this._name = data.name as CategoryName;
    this._description = data.description;
    this._parentId = data.parentId;
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
  get parentId(): number | undefined {
    return this._parentId;
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
   * Indica si la categoría es raíz (no tiene parentId)
   */
  public isRootCategory(): boolean {
    return this._parentId === undefined || this._parentId === null;
  }

  // --- Métodos de dominio para cambios de estado ---

  /**
   * Actualiza el nombre de la categoría
   * @param newName - nuevo nombre
   */
  public updateName(newName: string): void {
    this.validateName(newName);
    this._name = newName as CategoryName;
    this.touchUpdatedAt();
  }

  /**
   * Actualiza la descripción de la categoría
   * @param newDescription - nueva descripción
   */
  public updateDescription(newDescription?: string): void {
    this.validateDescription(newDescription);
    this._description = newDescription;
    this.touchUpdatedAt();
  }

  /**
   * Cambia la categoría padre
   * @param newParentId - nueva categoría padre
   */
  public setParent(newParentId?: number): void {
    if (newParentId !== undefined && newParentId < 0) {
      throw new Error('El parentId debe ser positivo');
    }
    this._parentId = newParentId;
    this.touchUpdatedAt();
  }

  /**
   * Activa la categoría
   */
  public activate(): void {
    this._isActive = true;
    this.touchUpdatedAt();
  }

  /**
   * Desactiva la categoría
   */
  public deactivate(): void {
    this._isActive = false;
    this.touchUpdatedAt();
  }

  // --- Validación centralizada y granular ---
  private validateCategoryData(data: ICategory): void {
    this.validateName(data.name);
    this.validateDescription(data.description);
    this.validateParentId(data.parentId);
  }
  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error(
        'El nombre de la categoría debe tener al menos 2 caracteres'
      );
    }
    if (name.length > 100) {
      throw new Error(
        'El nombre de la categoría no puede exceder 100 caracteres'
      );
    }
  }
  private validateDescription(description?: string): void {
    if (description && description.length > 1000) {
      throw new Error('La descripción no puede exceder 1000 caracteres');
    }
  }
  private validateParentId(parentId?: number): void {
    if (parentId !== undefined && parentId < 0) {
      throw new Error('El parentId debe ser positivo');
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
  public toJSON(): ICategory {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      parentId: this._parentId,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
