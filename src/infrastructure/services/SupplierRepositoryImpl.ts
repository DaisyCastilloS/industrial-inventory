import { BaseRepositoryImpl } from './base/BaseRepositoryImpl';
import {
  Supplier,
  ISupplier,
  SupplierName,
  SupplierEmail,
  ContactPerson,
} from '../../core/domain/entity/Supplier';
import { ISupplierRepository } from '../../core/domain/repository/SupplierRepository';
import { pool } from '../db/database';
import { ServiceResult } from './base/ServiceTypes';
import { AuditLog } from '../../core/domain/entity/AuditLog';

export class SupplierRepositoryImpl
  extends BaseRepositoryImpl<Supplier>
  implements ISupplierRepository
{
  protected tableName = 'suppliers';
  protected entityClass = Supplier;

  protected getAllowedFields(): string[] {
    return [
      'id', 'name', 'description', 'contactPerson', 'email',
      'phone', 'address', 'rating', 'lastDeliveryDate', 'isActive',
      'createdAt', 'updatedAt'
    ];
  }

  protected mapFieldName(field: string): string {
    // Mapeo específico para campos de la entidad Supplier
    const fieldMapping: { [key: string]: string } = {
      '_name': 'name',
      '_email': 'email',
      '_phone': 'phone',
      '_address': 'address',
      '_isActive': 'is_active',
      '_createdAt': 'created_at',
      '_updatedAt': 'updated_at',
      'name': 'name',
      'email': 'email',
      'phone': 'phone',
      'address': 'address',
      'isActive': 'is_active',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    };
    
    return fieldMapping[field] || field;
  }

  async findActive(): Promise<ServiceResult<Supplier[]>> {
    return this.findByField('is_active', true);
  }

  async findByName(name: SupplierName | string): Promise<ServiceResult<Supplier | null>> {
    const result = await this.findByField('name', name);
    return { 
      success: result.success,
      data: result.success && result.data ? result.data[0] || null : null 
    };
  }

  async findByEmail(email: SupplierEmail | string): Promise<ServiceResult<Supplier | null>> {
    const result = await this.findByField('email', email);
    return { 
      success: result.success,
      data: result.success && result.data ? result.data[0] || null : null 
    };
  }

  async findByContactPerson(contactPerson: ContactPerson | string): Promise<ServiceResult<Supplier[]>> {
    return this.findByField('contact_person', contactPerson);
  }

  async findWithCompleteContact(): Promise<ServiceResult<Supplier[]>> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE email IS NOT NULL 
      AND contact_person IS NOT NULL 
      AND phone IS NOT NULL 
      AND address IS NOT NULL
    `;
    const result = await pool.query(query);
    return { success: true, data: result.rows.map(row => new Supplier(row)) };
  }

  async existsByName(name: SupplierName | string): Promise<boolean> {
    return this.existsByField('name', name);
  }

  async existsByEmail(email: SupplierEmail | string): Promise<boolean> {
    return this.existsByField('email', email);
  }

  async getStats(): Promise<ServiceResult<{
    totalSuppliers: number;
    activeSuppliers: number;
    suppliersWithCompleteContact: number;
  }>> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN email IS NOT NULL 
          AND contact_person IS NOT NULL 
          AND phone IS NOT NULL 
          AND address IS NOT NULL THEN 1 END) as complete_contact
      FROM ${this.tableName}
    `;
    const result = await pool.query(query);
    return {
      success: true,
      data: {
        totalSuppliers: parseInt(result.rows[0].total),
        activeSuppliers: parseInt(result.rows[0].active),
        suppliersWithCompleteContact: parseInt(result.rows[0].complete_contact)
      }
    };
  }

  async getAuditTrail(supplierId: number): Promise<ServiceResult<AuditLog<ISupplier>[]>> {
    const query = `
      SELECT * FROM audit_logs 
      WHERE table_name = $1 AND record_id = $2 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [this.tableName, supplierId]);
    return { success: true, data: result.rows.map(row => new AuditLog(row)) };
  }

  async create(supplier: ISupplier): Promise<ServiceResult<Supplier>> {
    try {
      const query = `
        INSERT INTO ${this.tableName} (name, email, phone, address, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `;
      
      const values = [
        supplier.name,
        supplier.email || null,
        supplier.phone || null,
        supplier.address || null,
        supplier.isActive !== undefined ? supplier.isActive : true
      ];

      const result = await pool.query(query, values);
      const createdSupplier = this.mapRowToEntity(result.rows[0]);
      return { success: true, data: createdSupplier };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}
