/**
 * @fileoverview Base entity class for domain entities
 * @author Daisy Castillo
 * @version 1.0.0
 */

export interface IBaseEntity {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
}

/**
 * Base entity class with common functionality
 */
export abstract class BaseEntity implements IBaseEntity {
  protected readonly _id?: number;
  protected readonly _createdAt?: Date;
  protected _updatedAt?: Date;
  protected _isActive: boolean;

  constructor(data: IBaseEntity) {
    this.validateBaseData(data);
    this._id = data.id;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
    this._isActive = data.isActive;
  }

  /**
   * Validates base entity data
   */
  protected validateBaseData(data: IBaseEntity): void {
    if (data.id !== undefined && (!Number.isInteger(data.id) || data.id < 1)) {
      throw new Error('ID inválido: debe ser un número entero positivo');
    }

    if (data.createdAt && !(data.createdAt instanceof Date)) {
      throw new Error('createdAt inválido: debe ser una instancia de Date');
    }

    if (data.updatedAt && !(data.updatedAt instanceof Date)) {
      throw new Error('updatedAt inválido: debe ser una instancia de Date');
    }

    if (typeof data.isActive !== 'boolean') {
      throw new Error('isActive inválido: debe ser un booleano');
    }
  }

  /**
   * Updates the entity's updatedAt timestamp
   */
  protected touch(): void {
    this._updatedAt = new Date();
  }

  /**
   * Activates the entity
   */
  public activate(): void {
    this._isActive = true;
    this.touch();
  }

  /**
   * Deactivates the entity
   */
  public deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  // Getters
  public get id(): number | undefined {
    return this._id;
  }

  public get createdAt(): Date | undefined {
    return this._createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this._updatedAt;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Checks if the entity is new (not yet persisted)
   */
  public isNew(): boolean {
    return this._id === undefined;
  }

  /**
   * Validates that the entity has been properly persisted
   */
  public validatePersistence(): void {
    if (!this._id || !this._createdAt || !this._updatedAt) {
      throw new Error(
        'Persistencia inconsistente: la entidad no tiene id, createdAt o updatedAt'
      );
    }
  }

  /**
   * Returns a plain object representation of the entity
   */
  public toJSON(): IBaseEntity {
    return {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      isActive: this._isActive,
    };
  }
}
