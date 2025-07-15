/**
 * @fileoverview Implementación del repositorio de proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

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

  /**
   * Obtiene proveedores activos
   * @returns Lista de proveedores activos
   */
  async findActive(): Promise<ServiceResult<Supplier[]>> {
    return this.findByField('is_active', true);
  }

  /**
   * Busca un proveedor por nombre
   */
  async findByName(
    name: SupplierName | string
  ): Promise<ServiceResult<Supplier | null>> {
    const result = await this.findByField('name', name);
    return {
      ...result,
      data: result.data?.[0] || null,
    };
  }

  /**
   * Busca un proveedor por email
   */
  async findByEmail(
    email: SupplierEmail | string
  ): Promise<ServiceResult<Supplier | null>> {
    const result = await this.findByField('email', email);
    return {
      ...result,
      data: result.data?.[0] || null,
    };
  }

  /**
   * Busca proveedores por persona de contacto
   */
  async findByContactPerson(
    contactPerson: ContactPerson | string
  ): Promise<ServiceResult<Supplier[]>> {
    return this.findByField('contact_person', contactPerson);
  }

  /**
   * Busca proveedores con información de contacto completa
   */
  async findWithCompleteContact(): Promise<ServiceResult<Supplier[]>> {
    try {
      const query = `
        SELECT * FROM ${this.tableName} 
        WHERE email IS NOT NULL AND phone IS NOT NULL AND contact_person IS NOT NULL
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query);
      return {
        success: true,
        data: result.rows.map(row => this.mapRowToEntity(row)),
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Verifica si existe un proveedor con el nombre dado
   */
  async existsByName(name: SupplierName | string): Promise<boolean> {
    const query = `SELECT COUNT(*) FROM ${this.tableName} WHERE name = $1`;
    const result = await pool.query(query, [name]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Verifica si existe un proveedor con el email dado
   */
  async existsByEmail(email: SupplierEmail | string): Promise<boolean> {
    const query = `SELECT COUNT(*) FROM ${this.tableName} WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Obtiene estadísticas de proveedores
   */
  async getStats(): Promise<
    ServiceResult<{
      totalSuppliers: number;
      activeSuppliers: number;
      suppliersWithCompleteContact: number;
    }>
  > {
    try {
      const totalQuery = `SELECT COUNT(*) FROM ${this.tableName}`;
      const activeQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE is_active = true`;
      const completeContactQuery = `
        SELECT COUNT(*) FROM ${this.tableName} 
        WHERE email IS NOT NULL AND phone IS NOT NULL AND contact_person IS NOT NULL
      `;

      const [totalResult, activeResult, completeContactResult] =
        await Promise.all([
          pool.query(totalQuery),
          pool.query(activeQuery),
          pool.query(completeContactQuery),
        ]);

      return {
        success: true,
        data: {
          totalSuppliers: parseInt(totalResult.rows[0].count),
          activeSuppliers: parseInt(activeResult.rows[0].count),
          suppliersWithCompleteContact: parseInt(
            completeContactResult.rows[0].count
          ),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene el historial de auditoría de un proveedor
   */
  async getAuditTrail(
    id: number
  ): Promise<ServiceResult<AuditLog<ISupplier>[]>> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE table_name = 'suppliers' AND record_id = $1 
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query, [id]);
      return {
        success: true,
        data: result.rows,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }
}
