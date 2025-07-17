import {
  ServiceResult,
  PaginatedResult,
  RepositoryOptions,
} from '../../../../infrastructure/services/base/ServiceTypes';

export interface BaseEntity {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface IBaseRepository<T extends BaseEntity> {
  create(entity: Partial<T>): Promise<ServiceResult<T>>;
  findById(id: number, options?: RepositoryOptions): Promise<ServiceResult<T>>;
  findAll(
    options?: RepositoryOptions
  ): Promise<ServiceResult<PaginatedResult<T>>>;
  update(id: number, entityData: Partial<T>): Promise<ServiceResult<T>>;
  delete(id: number): Promise<ServiceResult<void>>;
  activate(id: number): Promise<ServiceResult<T>>;
  deactivate(id: number): Promise<ServiceResult<T>>;
  findByField(
    field: string,
    value: any,
    options?: RepositoryOptions
  ): Promise<ServiceResult<T[]>>;
  exists(id: number): Promise<boolean>;
  existsByField(field: string, value: any): Promise<boolean>;
}

export interface IBaseRepositoryWithSearch<T extends BaseEntity>
  extends IBaseRepository<T> {
  search(
    query: string,
    options?: RepositoryOptions
  ): Promise<ServiceResult<T[]>>;
  searchByField(
    field: string,
    query: string,
    options?: RepositoryOptions
  ): Promise<ServiceResult<T[]>>;
}

export interface IBaseRepositoryWithAudit<T extends BaseEntity>
  extends IBaseRepository<T> {
  getAuditTrail(entityId: number): Promise<any[]>;
}
