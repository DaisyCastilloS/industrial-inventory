/**
 * @fileoverview Entidad de dominio para usuarios del sistema
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { UserRole } from '../../00-constants/RoleTypes';

/**
 * Interfaz para datos de usuario
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
 * Entidad de dominio para usuarios
 * @class User
 */
export class User {
  private readonly _id?: number;
  private _email: string;
  private _password: string;
  private _name: string;
  private _role: UserRole;
  private _isActive: boolean;
  private readonly _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(data: IUser) {
    this.validateUserData(data);
    this._id = data.id;
    this._email = data.email;
    this._password = data.password;
    this._name = data.name;
    this._role = data.role as UserRole;
    this._isActive = data.isActive;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;
  }

  // Getters solo lectura
  get id(): number | undefined { return this._id; }
  get email(): string { return this._email; }
  get password(): string { return this._password; }
  get name(): string { return this._name; }
  get role(): UserRole { return this._role; }
  get isActive(): boolean { return this._isActive; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  // Métodos de dominio
  public updatePassword(newPassword: string): void {
    if (!newPassword || newPassword.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
    this._password = newPassword;
    this._updatedAt = new Date();
  }

  public updateName(newName: string): void {
    if (!newName || newName.trim().length < 2) throw new Error('El nombre debe tener al menos 2 caracteres');
    this._name = newName;
    this._updatedAt = new Date();
  }

  public updateRole(newRole: UserRole): void {
    if (!Object.values(UserRole).includes(newRole)) throw new Error('Rol de usuario inválido');
    this._role = newRole;
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
  private validateUserData(data: IUser): void {
    if (!data.email || !data.email.includes('@')) {
      throw new Error('Email inválido');
    }
    if (!data.password || data.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
    if (!Object.values(UserRole).includes(data.role as UserRole)) {
      throw new Error('Rol de usuario inválido');
    }
  }

  public toJSON(): IUser {
    return {
      id: this._id,
      email: this._email,
      password: this._password,
      name: this._name,
      role: this._role,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
} 