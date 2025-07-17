import { BaseEntity, IBaseEntity } from './base/BaseEntity';

type SupplierName = string & { readonly supplier: unique symbol };
type ContactPerson = string & { readonly contact: unique symbol };
type SupplierEmail = string & { readonly email: unique symbol };
type SupplierPhone = string & { readonly phone: unique symbol };
type SupplierAddress = string & { readonly address: unique symbol };

export type { SupplierName, SupplierEmail, ContactPerson };

export interface ISupplier extends IBaseEntity {
  name: string;
  description?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  rating?: number;
  lastDeliveryDate?: Date;
}

export class Supplier extends BaseEntity {
  private _name: SupplierName;
  private _description?: string;
  private _contactPerson?: ContactPerson;
  private _email?: SupplierEmail;
  private _phone?: SupplierPhone;
  private _address?: SupplierAddress;
  private _rating?: number;
  private _lastDeliveryDate?: Date;

  constructor(data: ISupplier) {
    super(data);
    this.validateSupplierData(data);
    this._name = data.name as SupplierName;
    this._description = data.description;
    this._contactPerson = data.contactPerson as ContactPerson;
    this._email = data.email as SupplierEmail;
    this._phone = data.phone as SupplierPhone;
    this._address = data.address as SupplierAddress;
    this._rating = data.rating;
    this._lastDeliveryDate = data.lastDeliveryDate;
  }

  get name(): string {
    return this._name;
  }
  get description(): string | undefined {
    return this._description;
  }
  get contactPerson(): string | undefined {
    return this._contactPerson;
  }
  get email(): string | undefined {
    return this._email;
  }
  get phone(): string | undefined {
    return this._phone;
  }
  get address(): string | undefined {
    return this._address;
  }
  get rating(): number | undefined {
    return this._rating;
  }
  get lastDeliveryDate(): Date | undefined {
    return this._lastDeliveryDate;
  }

  public isActiveSupplier(): boolean {
    return this.isActive;
  }

  public updateName(newName: string): void {
    this.validateName(newName);
    this._name = newName as SupplierName;
    this.touch();
  }

  public updateDescription(newDescription?: string): void {
    this.validateDescription(newDescription);
    this._description = newDescription;
    this.touch();
  }

  public updateContactPerson(newContact?: string): void {
    this.validateContactPerson(newContact);
    this._contactPerson = newContact as ContactPerson;
    this.touch();
  }

  public updateEmail(newEmail?: string): void {
    this.validateEmail(newEmail);
    this._email = newEmail as SupplierEmail;
    this.touch();
  }

  public updatePhone(newPhone?: string): void {
    this.validatePhone(newPhone);
    this._phone = newPhone as SupplierPhone;
    this.touch();
  }

  public updateAddress(newAddress?: string): void {
    this.validateAddress(newAddress);
    this._address = newAddress as SupplierAddress;
    this.touch();
  }

  public updateRating(newRating?: number): void {
    this.validateRating(newRating);
    this._rating = newRating;
    this.touch();
  }

  public updateLastDeliveryDate(newDate?: Date): void {
    this._lastDeliveryDate = newDate;
    this.touch();
  }

  private validateSupplierData(data: ISupplier): void {
    this.validateName(data.name);
    this.validateDescription(data.description);
    this.validateContactPerson(data.contactPerson);
    this.validateEmail(data.email);
    this.validatePhone(data.phone);
    this.validateAddress(data.address);
    this.validateRating(data.rating);
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error(
        'El nombre del proveedor debe tener al menos 2 caracteres'
      );
    }
    if (name.length > 200) {
      throw new Error(
        'El nombre del proveedor no puede exceder 200 caracteres'
      );
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

  private validateRating(rating?: number): void {
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      throw new Error('El rating debe estar entre 0 y 5');
    }
  }

  public toJSON(): ISupplier {
    return {
      ...super.toJSON(),
      name: this._name,
      description: this._description,
      contactPerson: this._contactPerson,
      email: this._email,
      phone: this._phone,
      address: this._address,
      rating: this._rating,
      lastDeliveryDate: this._lastDeliveryDate,
    };
  }
}
