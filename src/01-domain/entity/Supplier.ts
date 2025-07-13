/**
 * @fileoverview Entidad de dominio para proveedores
 * @author Industrial Inventory System
 * @version 1.0.0
 */

/**
 * Interfaz para datos de proveedor
 */
export interface ISupplier {
  id?: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entidad de dominio para proveedores
 * @class Supplier
 */
export class Supplier {
  private readonly _id?: number;
  private _name: string;
  private _contactPerson?: string;
  private _email?: string;
  private _phone?: string;
  private _address?: string;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(data: ISupplier) {
    this.validateSupplierData(data);
    this._id = data.id;
    this._name = data.name;
    this._contactPerson = data.contactPerson;
    this._email = data.email;
    this._phone = data.phone;
    this._address = data.address;
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  // Getters solo lectura
  get id(): number | undefined { return this._id; }
  get name(): string { return this._name; }
  get contactPerson(): string | undefined { return this._contactPerson; }
  get email(): string | undefined { return this._email; }
  get phone(): string | undefined { return this._phone; }
  get address(): string | undefined { return this._address; }
  get isActive(): boolean { return this._isActive; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  // Métodos de dominio
  public updateName(newName: string): void {
    if (!newName || newName.trim().length < 2) throw new Error('El nombre debe tener al menos 2 caracteres');
    this._name = newName;
    this._updatedAt = new Date();
  }

  public updateContactPerson(newContactPerson: string): void {
    if (newContactPerson && newContactPerson.length > 100) throw new Error('El contacto no puede exceder 100 caracteres');
    this._contactPerson = newContactPerson;
    this._updatedAt = new Date();
  }

  public updatePhone(newPhone: string): void {
    if (newPhone && newPhone.length > 20) throw new Error('El teléfono no puede exceder 20 caracteres');
    this._phone = newPhone;
    this._updatedAt = new Date();
  }

  public updateEmail(newEmail: string): void {
    if (newEmail && !newEmail.includes('@')) throw new Error('Email inválido');
    this._email = newEmail;
    this._updatedAt = new Date();
  }

  public updateAddress(newAddress: string): void {
    if (newAddress && newAddress.length > 500) throw new Error('La dirección no puede exceder 500 caracteres');
    this._address = newAddress;
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
  private validateSupplierData(data: ISupplier): void {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('El nombre del proveedor debe tener al menos 2 caracteres');
    }
    if (data.name.length > 200) {
      throw new Error('El nombre del proveedor no puede exceder 200 caracteres');
    }
    if (data.contactPerson && data.contactPerson.length > 100) {
      throw new Error('El contacto no puede exceder 100 caracteres');
    }
    if (data.phone && data.phone.length > 20) {
      throw new Error('El teléfono no puede exceder 20 caracteres');
    }
    if (data.email && !data.email.includes('@')) {
      throw new Error('Email inválido');
    }
  }

  public toJSON(): ISupplier {
    return {
      id: this._id,
      name: this._name,
      contactPerson: this._contactPerson,
      email: this._email,
      phone: this._phone,
      address: this._address,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
} 