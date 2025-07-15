/**
 * @fileoverview Entidad de dominio para ubicaciones de almacén
 * @author Daisy Castillo
 * @version 1.0.0
 */

/**
 * Tipos semánticos para mayor claridad y robustez
 */
type LocationName = string & { readonly location: unique symbol };
type LocationCode = string & { readonly code: unique symbol };
type LocationType = string & { readonly type: unique symbol };
type Zone = string & { readonly zone: unique symbol };
type Shelf = string & { readonly shelf: unique symbol };

export type { LocationName, LocationCode, LocationType };

/**
 * Interfaz para datos de ubicación alineada a la tabla 'locations'
 */
export interface ILocation {
  id?: number;
  name: string;
  description?: string;
  code: string;
  type: string;
  parentId?: number;
  zone?: string;
  shelf?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entidad de dominio para ubicaciones de almacén
 *
 * - Solo se puede modificar el estado mediante métodos de dominio.
 * - Validación centralizada y exhaustiva.
 * - Getters públicos para todos los campos relevantes.
 *
 * @class Location
 */
export class Location {
  private readonly _id?: number;
  private _name: LocationName;
  private _description?: string;
  private _code: LocationCode;
  private _type: LocationType;
  private _parentId?: number;
  private _zone?: Zone;
  private _shelf?: Shelf;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  /**
   * Crea una nueva instancia de Location
   * @param data - Datos de la ubicación
   * @throws {Error} Si los datos son inválidos
   */
  constructor(data: ILocation) {
    this.validateLocationData(data);
    this._id = data.id;
    this._name = data.name as LocationName;
    this._description = data.description;
    this._code = data.code as LocationCode;
    this._type = data.type as LocationType;
    this._parentId = data.parentId;
    this._zone = data.zone as Zone;
    this._shelf = data.shelf as Shelf;
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
  get code(): string {
    return this._code;
  }
  get type(): string {
    return this._type;
  }
  get parentId(): number | undefined {
    return this._parentId;
  }
  get zone(): string | undefined {
    return this._zone;
  }
  get shelf(): string | undefined {
    return this._shelf;
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
   * Indica si la ubicación está activa
   */
  public isActiveLocation(): boolean {
    return this._isActive;
  }

  // --- Métodos de dominio para cambios de estado ---

  /**
   * Actualiza el nombre de la ubicación
   * @param newName - nuevo nombre
   */
  public updateName(newName: string): void {
    this.validateName(newName);
    this._name = newName as LocationName;
    this.touchUpdatedAt();
  }

  /**
   * Actualiza la descripción de la ubicación
   * @param newDescription - nueva descripción
   */
  public updateDescription(newDescription?: string): void {
    this.validateDescription(newDescription);
    this._description = newDescription;
    this.touchUpdatedAt();
  }

  /**
   * Actualiza el código de la ubicación
   * @param newCode - nuevo código
   */
  public updateCode(newCode: string): void {
    this.validateCode(newCode);
    this._code = newCode as LocationCode;
    this.touchUpdatedAt();
  }

  /**
   * Actualiza el tipo de la ubicación
   * @param newType - nuevo tipo
   */
  public updateType(newType: string): void {
    this.validateType(newType);
    this._type = newType as LocationType;
    this.touchUpdatedAt();
  }

  /**
   * Actualiza el ID de la ubicación padre
   * @param newParentId - nuevo ID de padre
   */
  public updateParentId(newParentId?: number): void {
    this.validateParentId(newParentId);
    this._parentId = newParentId;
    this.touchUpdatedAt();
  }

  /**
   * Actualiza la zona de la ubicación
   * @param newZone - nueva zona
   */
  public updateZone(newZone?: string): void {
    this.validateZone(newZone);
    this._zone = newZone as Zone;
    this.touchUpdatedAt();
  }

  /**
   * Actualiza el estante de la ubicación
   * @param newShelf - nuevo estante
   */
  public updateShelf(newShelf?: string): void {
    this.validateShelf(newShelf);
    this._shelf = newShelf as Shelf;
    this.touchUpdatedAt();
  }

  /**
   * Activa la ubicación
   */
  public activate(): void {
    this._isActive = true;
    this.touchUpdatedAt();
  }

  /**
   * Desactiva la ubicación
   */
  public deactivate(): void {
    this._isActive = false;
    this.touchUpdatedAt();
  }

  // --- Validación centralizada y granular ---
  private validateLocationData(data: ILocation): void {
    this.validateName(data.name);
    this.validateDescription(data.description);
    this.validateCode(data.code);
    this.validateType(data.type);
    this.validateParentId(data.parentId);
    this.validateZone(data.zone);
    this.validateShelf(data.shelf);
  }
  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error(
        'El nombre de la ubicación debe tener al menos 2 caracteres'
      );
    }
    if (name.length > 100) {
      throw new Error(
        'El nombre de la ubicación no puede exceder 100 caracteres'
      );
    }
  }
  private validateDescription(description?: string): void {
    if (description && description.length > 1000) {
      throw new Error('La descripción no puede exceder 1000 caracteres');
    }
  }
  private validateCode(code: string): void {
    if (!code || code.trim().length < 2) {
      throw new Error(
        'El código de la ubicación debe tener al menos 2 caracteres'
      );
    }
    if (code.length > 20) {
      throw new Error(
        'El código de la ubicación no puede exceder 20 caracteres'
      );
    }
  }
  private validateType(type: string): void {
    if (!type || type.trim().length < 2) {
      throw new Error(
        'El tipo de la ubicación debe tener al menos 2 caracteres'
      );
    }
    if (type.length > 50) {
      throw new Error('El tipo de la ubicación no puede exceder 50 caracteres');
    }
  }
  private validateParentId(parentId?: number): void {
    if (parentId !== undefined && parentId <= 0) {
      throw new Error(
        'El ID de la ubicación padre debe ser un número positivo'
      );
    }
  }
  private validateZone(zone?: string): void {
    if (zone && zone.length > 50) {
      throw new Error('La zona no puede exceder 50 caracteres');
    }
  }
  private validateShelf(shelf?: string): void {
    if (shelf && shelf.length > 50) {
      throw new Error('El estante no puede exceder 50 caracteres');
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
  public toJSON(): ILocation {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      code: this._code,
      type: this._type,
      parentId: this._parentId,
      zone: this._zone,
      shelf: this._shelf,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
