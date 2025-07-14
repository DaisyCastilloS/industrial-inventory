/**
 * @fileoverview Entidad de dominio para proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

/**
 * Tipos semánticos para mayor claridad y robustez
 */
type SupplierName = string & { readonly supplier: unique symbol };
type ContactPerson = string & { readonly contact: unique symbol };
type SupplierEmail = string & { readonly email: unique symbol };
type SupplierPhone = string & { readonly phone: unique symbol };
type SupplierAddress = string & { readonly address: unique symbol };

export type { SupplierName, SupplierEmail, ContactPerson };

/**
 * Interfaz para datos de proveedor alineada a la tabla 'suppliers'
 */
export interface ISupplier {
  id?: number;
  name: string;
  description?: string;
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
 *
 * - Solo se puede modificar el estado mediante métodos de dominio.
 * - Validación centralizada y exhaustiva.
 * - Getters públicos para todos los campos relevantes.
 *
 * @class Supplier
 */
export class Supplier {
  private readonly _id?: number;
  private _name: SupplierName;
  private _description?: string;
  private _contactPerson?: ContactPerson;
  private _email?: SupplierEmail;
  private _phone?: SupplierPhone;
  private _address?: SupplierAddress;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  /**
   * Crea una nueva instancia de Supplier
   * @param data - Datos del proveedor
   * @throws {Error} Si los datos son inválidos
   */
  constructor(data: ISupplier) {
    this.validateSupplierData(data);
    this._id = data.id;
    this._name = data.name as SupplierName;
    this._description = data.description;
    this._contactPerson = data.contactPerson as ContactPerson;
    this._email = data.email as SupplierEmail;
    this._phone = data.phone as SupplierPhone;
    this._address = data.address as SupplierAddress;
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  // --- Getters públicos ---
  get id(): number | undefined { return this._id; }
  get name(): string { return this._name; }
  get description(): string | undefined { return this._description; }
  get contactPerson(): string | undefined { return this._contactPerson; }
  get email(): string | undefined { return this._email; }
  get phone(): string | undefined { return this._phone; }
  get address(): string | undefined { return this._address; }
  get isActive(): boolean { return this._isActive; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  /**
   * Indica si el proveedor está activo
   */
  public isActiveSupplier(): boolean {
    return this._isActive;
  }

  // --- Métodos de dominio para cambios de estado ---

  /**
   * Actualiza el nombre del proveedor
   * @param newName - nuevo nombre
   */
  public updateName(newName: string): void {
    this.validateName(newName);
    this._name = newName as SupplierName;
    this.touchUpdatedAt();
  }

  /**
   * Actualiza la descripción del proveedor
   * @param newDescription - nueva descripción
   */
  public updateDescription(newDescription?: string): void {
    this.validateDescription(newDescription);
    this._description = newDescription;
    this.touchUpdatedAt();
  }

  /**
   * Actualiza el contacto del proveedor
   * @param newContact - nuevo contacto
   */
  public updateContactPerson(newContact?: string): void {
    this.validateContactPerson(newContact);
    this._contactPerson = newContact as ContactPerson;
    this.touchUpdatedAt();
  }

  /**
   * Actualiza el email del proveedor
   * @param newEmail - nuevo email
   */
  public updateEmail(newEmail?: string): void {
    this.validateEmail(newEmail);
    this._email = newEmail as SupplierEmail;
    this.touchUpdatedAt();
  }

  /**
   * Actualiza el teléfono del proveedor
   * @param newPhone - nuevo teléfono
   */
  public updatePhone(newPhone?: string): void {
    this.validatePhone(newPhone);
    this._phone = newPhone as SupplierPhone;
    this.touchUpdatedAt();
  }

  /**
   * Actualiza la dirección del proveedor
   * @param newAddress - nueva dirección
   */
  public updateAddress(newAddress?: string): void {
    this.validateAddress(newAddress);
    this._address = newAddress as SupplierAddress;
    this.touchUpdatedAt();
  }

  /**
   * Activa el proveedor
   */
  public activate(): void {
    this._isActive = true;
    this.touchUpdatedAt();
  }

  /**
   * Desactiva el proveedor
   */
  public deactivate(): void {
    this._isActive = false;
    this.touchUpdatedAt();
  }

  // --- Validación centralizada y granular ---
  private validateSupplierData(data: ISupplier): void {
    this.validateName(data.name);
    this.validateDescription(data.description);
    this.validateContactPerson(data.contactPerson);
    this.validateEmail(data.email);
    this.validatePhone(data.phone);
    this.validateAddress(data.address);
  }
  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('El nombre del proveedor debe tener al menos 2 caracteres');
    }
    if (name.length > 200) {
      throw new Error('El nombre del proveedor no puede exceder 200 caracteres');
    }
  }
  private validateDescription(description?: string): void {
    if (description && description.length > 255) {
      throw new Error('La descripción no puede exceder 255 caracteres');
    }
  }
  private validateContactPerson(contactPerson?: string): void {
    if (contactPerson && contactPerson.length > 100) {
      throw new Error('El contacto no puede exceder 100 caracteres');
    }
  }
  private validateEmail(email?: string): void {
    if (email && email.length > 100) {
      throw new Error('El email no puede exceder 100 caracteres');
    }
  }
  private validatePhone(phone?: string): void {
    if (phone && phone.length > 20) {
      throw new Error('El teléfono no puede exceder 20 caracteres');
    }
  }
  private validateAddress(address?: string): void {
    if (address && address.length > 1000) {
      throw new Error('La dirección no puede exceder 1000 caracteres');
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
  public toJSON(): ISupplier {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
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