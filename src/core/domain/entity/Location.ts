type LocationName = string & { readonly location: unique symbol };
type Zone = string & { readonly zone: unique symbol };
type Shelf = string & { readonly shelf: unique symbol };
type LocationCode = string & { readonly code: unique symbol };
type LocationType = string & { readonly type: unique symbol };

export type { LocationName };

export interface ILocation {
  id?: number;
  name: string;
  address?: string;
  description?: string;
  code?: string;
  type?: string;
  zone?: string;
  shelf?: string;
  capacity?: number;
  currentUsage?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Location {
  private readonly _id?: number;
  private _name: LocationName;
  private _address?: string;
  private _description?: string;
  private _code?: LocationCode;
  private _type?: LocationType;
  private _zone?: Zone;
  private _shelf?: Shelf;
  private _capacity?: number;
  private _currentUsage?: number;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(data: ILocation) {
    this.validateLocationData(data);
    this._id = data.id;
    this._name = data.name as LocationName;
    this._address = data.address;
    this._description = data.description;
    this._code = data.code as LocationCode;
    this._type = data.type as LocationType;
    this._zone = data.zone as Zone;
    this._shelf = data.shelf as Shelf;
    this._capacity = data.capacity;
    this._currentUsage = data.currentUsage;
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  get id(): number | undefined {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get address(): string | undefined {
    return this._address;
  }
  get description(): string | undefined {
    return this._description;
  }
  get code(): string | undefined {
    return this._code;
  }
  get type(): string | undefined {
    return this._type;
  }
  get zone(): string | undefined {
    return this._zone;
  }
  get shelf(): string | undefined {
    return this._shelf;
  }
  get capacity(): number | undefined {
    return this._capacity;
  }
  get currentUsage(): number | undefined {
    return this._currentUsage;
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

  public isActiveLocation(): boolean {
    return this._isActive;
  }

  public updateName(newName: string): void {
    this.validateName(newName);
    this._name = newName as LocationName;
    this.touchUpdatedAt();
  }

  public updateDescription(newDescription?: string): void {
    this.validateDescription(newDescription);
    this._description = newDescription;
    this.touchUpdatedAt();
  }

  public updateCode(newCode?: string): void {
    this.validateCode(newCode);
    this._code = newCode as LocationCode;
    this.touchUpdatedAt();
  }

  public updateType(newType?: string): void {
    this.validateType(newType);
    this._type = newType as LocationType;
    this.touchUpdatedAt();
  }

  public updateZone(newZone?: string): void {
    this.validateZone(newZone);
    this._zone = newZone as Zone;
    this.touchUpdatedAt();
  }

  public updateShelf(newShelf?: string): void {
    this.validateShelf(newShelf);
    this._shelf = newShelf as Shelf;
    this.touchUpdatedAt();
  }

  public updateCapacity(newCapacity?: number): void {
    this.validateCapacity(newCapacity);
    this._capacity = newCapacity;
    this.touchUpdatedAt();
  }

  public updateCurrentUsage(newUsage?: number): void {
    this.validateCurrentUsage(newUsage);
    this._currentUsage = newUsage;
    this.touchUpdatedAt();
  }

  public activate(): void {
    this._isActive = true;
    this.touchUpdatedAt();
  }

  public deactivate(): void {
    this._isActive = false;
    this.touchUpdatedAt();
  }

  private validateLocationData(data: ILocation): void {
    this.validateName(data.name);
    this.validateDescription(data.description);
    this.validateCode(data.code);
    this.validateType(data.type);
    this.validateZone(data.zone);
    this.validateShelf(data.shelf);
    this.validateCapacity(data.capacity);
    this.validateCurrentUsage(data.currentUsage);
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

  private validateCode(code?: string): void {
    if (code && code.length > 50) {
      throw new Error('El código no puede exceder 50 caracteres');
    }
  }

  private validateType(type?: string): void {
    if (type && type.length > 50) {
      throw new Error('El tipo no puede exceder 50 caracteres');
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

  private validateCapacity(capacity?: number): void {
    if (capacity !== undefined && capacity < 0) {
      throw new Error('La capacidad debe ser un número positivo');
    }
  }

  private validateCurrentUsage(usage?: number): void {
    if (usage !== undefined) {
      if (usage < 0) {
        throw new Error('El uso actual debe ser un número positivo');
      }
      if (this._capacity !== undefined && usage > this._capacity) {
        throw new Error('El uso actual no puede exceder la capacidad');
      }
    }
  }

  private touchUpdatedAt(): void {
    this._updatedAt = new Date();
  }

  public toJSON(): ILocation {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      code: this._code,
      type: this._type,
      zone: this._zone,
      shelf: this._shelf,
      capacity: this._capacity,
      currentUsage: this._currentUsage,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
