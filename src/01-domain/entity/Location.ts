/**
 * @fileoverview Entidad de dominio para ubicaciones de almacén
 * @author Industrial Inventory System
 * @version 1.0.0
 */

/**
 * Interfaz para datos de ubicación
 */
export interface ILocation {
  id?: number;
  name: string;
  description?: string;
  zone?: string;
  shelf?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entidad de dominio para ubicaciones
 * @class Location
 */
export class Location {
  private readonly _id?: number;
  private _name: string;
  private _description?: string;
  private _zone?: string;
  private _shelf?: string;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(data: ILocation) {
    this.validateLocationData(data);
    this._id = data.id;
    this._name = data.name;
    this._description = data.description;
    this._zone = data.zone;
    this._shelf = data.shelf;
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  // Getters solo lectura
  get id(): number | undefined { return this._id; }
  get name(): string { return this._name; }
  get description(): string | undefined { return this._description; }
  get zone(): string | undefined { return this._zone; }
  get shelf(): string | undefined { return this._shelf; }
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

  public updateZone(newZone: string): void {
    if (newZone && newZone.length > 50) throw new Error('La zona no puede exceder 50 caracteres');
    this._zone = newZone;
    this._updatedAt = new Date();
  }

  public updateShelf(newShelf: string): void {
    if (newShelf && newShelf.length > 50) throw new Error('El estante no puede exceder 50 caracteres');
    this._shelf = newShelf;
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
  private validateLocationData(data: ILocation): void {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('El nombre de la ubicación debe tener al menos 2 caracteres');
    }
    if (data.name.length > 255) {
      throw new Error('El nombre de la ubicación no puede exceder 255 caracteres');
    }
    if (data.description && data.description.length > 1000) {
      throw new Error('La descripción no puede exceder 1000 caracteres');
    }
  }

  public toJSON(): ILocation {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      zone: this._zone,
      shelf: this._shelf,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
} 