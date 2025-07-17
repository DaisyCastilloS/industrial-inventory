import { UserRole } from '../../../shared/constants/RoleTypes';
import { BaseEntity, IBaseEntity } from './base/BaseEntity';

type UserEmail = string & { readonly email: unique symbol };
type UserName = string & { readonly name: unique symbol };
type UserPassword = string & { readonly password: unique symbol };

export type { UserEmail, UserName };

export interface IUser extends IBaseEntity {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export class User extends BaseEntity {
  private _email: UserEmail;
  private _password: UserPassword;
  private _name: UserName;
  private _role: UserRole;

  constructor(data: IUser) {
    super(data);
    this.validateUserData(data);
    this._email = data.email as UserEmail;
    this._password = data.password as UserPassword;
    this._name = data.name as UserName;
    this._role = data.role as UserRole;
  }

  get email(): string {
    return this._email;
  }
  get name(): string {
    return this._name;
  }
  get role(): UserRole {
    return this._role;
  }
  get password(): string {
    return this._password;
  }

  public isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  public isActiveUser(): boolean {
    return this.isActive;
  }

  public changePassword(newPassword: string): void {
    this.validatePassword(newPassword);
    this._password = newPassword as UserPassword;
    this.touch();
  }

  public changeRole(newRole: UserRole): void {
    this.validateRole(newRole);
    this._role = newRole;
    this.touch();
  }

  public updateName(newName: string): void {
    this.validateName(newName);
    this._name = newName as UserName;
    this.touch();
  }

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
    // Remover validación de regex para permitir contraseñas más simples
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

  public toJSON(
    includePassword = false
  ): Omit<IUser, 'password'> & { password?: string } {
    const base = {
      ...super.toJSON(),
      email: this._email,
      name: this._name,
      role: this._role,
    };
    if (includePassword) {
      return { ...base, password: this._password };
    }
    return base;
  }
}
