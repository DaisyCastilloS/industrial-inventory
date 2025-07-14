/**
 * @fileoverview Entidad de dominio para usuarios del sistema
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { UserRole } from '../../00-constants/RoleTypes';

/**
 * Tipos semánticos para mayor claridad y robustez
 */
type UserEmail = string & { readonly email: unique symbol };
type UserName = string & { readonly name: unique symbol };
type UserPassword = string & { readonly password: unique symbol };

export type { UserEmail, UserName };

/**
 * Interfaz para datos de usuario alineada a la tabla 'users'
 */
export interface IUser {
  id?: number;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entidad de dominio para usuarios del sistema
 *
 * - Solo se puede modificar el estado mediante métodos de dominio.
 * - Validación centralizada y exhaustiva.
 * - Getters públicos para todos los campos relevantes.
 *
 * @class User
 */
export class User {
  private readonly _id?: number;
  private _email: UserEmail;
  private _password: UserPassword;
  private _name: UserName;
  private _role: UserRole;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  /**
   * Crea una nueva instancia de User
   * @param data - Datos del usuario
   * @throws {Error} Si los datos son inválidos
   */
  constructor(data: IUser) {
    this.validateUserData(data);
    this._id = data.id;
    this._email = data.email as UserEmail;
    this._password = data.password as UserPassword;
    this._name = data.name as UserName;
    this._role = data.role as UserRole;
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  // --- Getters públicos ---
  get id(): number | undefined { return this._id; }
  get email(): string { return this._email; }
  get name(): string { return this._name; }
  get role(): UserRole { return this._role; }
  get isActive(): boolean { return this._isActive; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }
  get password(): string { return this._password; } // Solo para uso de infraestructura

  /**
   * Indica si el usuario es administrador
   */
  public isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  /**
   * Indica si el usuario está activo
   */
  public isActiveUser(): boolean {
    return this._isActive;
  }

  // --- Métodos de dominio para cambios de estado ---

  /**
   * Cambia la contraseña del usuario
   * @param newPassword - nueva contraseña
   */
  public changePassword(newPassword: string): void {
    this.validatePassword(newPassword);
    this._password = newPassword as UserPassword;
    this.touchUpdatedAt();
  }

  /**
   * Cambia el rol del usuario
   * @param newRole - nuevo rol
   */
  public changeRole(newRole: UserRole): void {
    this.validateRole(newRole);
    this._role = newRole;
    this.touchUpdatedAt();
  }

  /**
   * Cambia el nombre del usuario
   * @param newName - nuevo nombre
   */
  public updateName(newName: string): void {
    this.validateName(newName);
    this._name = newName as UserName;
    this.touchUpdatedAt();
  }

  /**
   * Activa el usuario
   */
  public activate(): void {
    this._isActive = true;
    this.touchUpdatedAt();
  }

  /**
   * Desactiva el usuario
   */
  public deactivate(): void {
    this._isActive = false;
    this.touchUpdatedAt();
  }

  // --- Validación centralizada y granular ---
  private validateUserData(data: IUser): void {
    this.validateEmail(data.email);
    this.validatePassword(data.password);
    this.validateName(data.name);
    this.validateRole(data.role);
  }
  private validateEmail(email: string): void {
    if (!email || !email.includes('@')) {
      throw new Error('El email es obligatorio y debe ser válido');
    }
    if (email.length > 255) {
      throw new Error('El email no puede exceder 255 caracteres');
    }
  }
  private validatePassword(password: string): void {
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    if (password.length > 255) {
      throw new Error('La contraseña no puede exceder 255 caracteres');
    }
  }
  private validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
    if (name.length > 255) {
      throw new Error('El nombre no puede exceder 255 caracteres');
    }
  }
  private validateRole(role: UserRole): void {
    if (!Object.values(UserRole).includes(role)) {
      throw new Error('Rol de usuario inválido');
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
   * Por defecto, no expone el password (solo si se indica explicitamente)
   */
  public toJSON(includePassword = false): Omit<IUser, 'password'> & { password?: string } {
    const base = {
      id: this._id,
      email: this._email,
      name: this._name,
      role: this._role,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
    if (includePassword) {
      return { ...base, password: this._password };
    }
    return base;
  }
} 