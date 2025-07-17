import { Supplier, ISupplier } from '../entity/Supplier';
import { AuditLog } from '../entity/AuditLog';
import { ServiceResult } from '../../../infrastructure/services/base/ServiceTypes';
import { IBaseRepository } from './base/BaseRepository';
import type {
  SupplierName,
  SupplierEmail,
  ContactPerson,
} from '../entity/Supplier';

export interface ISupplierRepository extends IBaseRepository<Supplier> {
  findByName(
    name: SupplierName | string
  ): Promise<ServiceResult<Supplier | null>>;

  findByEmail(
    email: SupplierEmail | string
  ): Promise<ServiceResult<Supplier | null>>;

  findActive(): Promise<ServiceResult<Supplier[]>>;

  findByContactPerson(
    contactPerson: ContactPerson | string
  ): Promise<ServiceResult<Supplier[]>>;

  findWithCompleteContact(): Promise<ServiceResult<Supplier[]>>;

  existsByName(name: SupplierName | string): Promise<boolean>

  existsByEmail(email: SupplierEmail | string): Promise<boolean>;

  getStats(): Promise<
    ServiceResult<{
      totalSuppliers: number;
      activeSuppliers: number;
      suppliersWithCompleteContact: number;
    }>
  >;

  getAuditTrail(
    supplierId: number
  ): Promise<ServiceResult<AuditLog<ISupplier>[]>>;
}
