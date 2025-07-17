import { Category, ICategory } from '../entity/Category';
import { AuditLog } from '../entity/AuditLog';
import { IBaseRepository } from './base/BaseRepository';
import { ServiceResult } from '../../../infrastructure/services/base/ServiceTypes';
import type { CategoryName } from '../entity/Category';

export interface ICategoryRepository extends IBaseRepository<Category> {
  findByName(
    name: CategoryName | string
  ): Promise<ServiceResult<Category | null>>;

  findActive(): Promise<ServiceResult<Category[]>>;

  findRootCategories(): Promise<ServiceResult<Category[]>>;

  findChildren(parentId: number): Promise<ServiceResult<Category[]>>;

  findHierarchy(categoryId: number): Promise<ServiceResult<Category[]>>;

  existsByName(name: CategoryName | string): Promise<boolean>;

  hasChildren(categoryId: number): Promise<boolean>;

  getAuditTrail(
    categoryId: number
  ): Promise<ServiceResult<AuditLog<ICategory>[]>>;
}
