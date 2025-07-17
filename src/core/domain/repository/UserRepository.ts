import { User, IUser } from '../entity/User';
import { UserRole } from '../../../shared/constants/RoleTypes';
import { AuditLog } from '../entity/AuditLog';
import { IBaseRepository } from './base/BaseRepository';
import { ServiceResult } from '../../../infrastructure/services/base/ServiceTypes';
import type { UserEmail, UserName } from '../entity/User';

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: UserEmail | string): Promise<ServiceResult<User | null>>;

  findActive(): Promise<ServiceResult<User[]>>;

  findByRole(role: UserRole): Promise<ServiceResult<User[]>>;

  existsByEmail(email: UserEmail | string): Promise<boolean>;

  getAuditTrail(userId: number): Promise<ServiceResult<AuditLog<IUser>[]>>;
}
