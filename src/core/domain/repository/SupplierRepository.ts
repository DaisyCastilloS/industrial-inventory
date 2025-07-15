/**
 * @fileoverview Interfaz del repositorio de proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Supplier, ISupplier } from '../entity/Supplier';
import { AuditLog } from '../entity/AuditLog';
import { ServiceResult } from '../../../infrastructure/services/base/ServiceTypes';
import { IBaseRepository } from './base/BaseRepository';
// Tipos semánticos importados de la entidad Supplier
import type {
  SupplierName,
  SupplierEmail,
  ContactPerson,
} from '../entity/Supplier';

/**
 * Interfaz del repositorio de proveedores
 *
 * Todos los métodos usan tipado semántico y retornan entidades de dominio.
 */
export interface ISupplierRepository extends IBaseRepository<Supplier> {
  /**
   * Busca un proveedor por nombre (tipado semántico)
   * @param name - Nombre del proveedor
   * @returns Proveedor encontrado o null
   */
  findByName(
    name: SupplierName | string
  ): Promise<ServiceResult<Supplier | null>>;

  /**
   * Busca un proveedor por email (tipado semántico)
   * @param email - Email del proveedor
   * @returns Proveedor encontrado o null
   */
  findByEmail(
    email: SupplierEmail | string
  ): Promise<ServiceResult<Supplier | null>>;

  /**
   * Obtiene proveedores activos
   * @returns Lista de proveedores activos
   */
  findActive(): Promise<ServiceResult<Supplier[]>>;

  /**
   * Busca proveedores por persona de contacto (tipado semántico)
   * @param contactPerson - Persona de contacto
   * @returns Lista de proveedores que coinciden
   */
  findByContactPerson(
    contactPerson: ContactPerson | string
  ): Promise<ServiceResult<Supplier[]>>;

  /**
   * Busca proveedores con información de contacto completa
   * @returns Lista de proveedores con contacto completo
   */
  findWithCompleteContact(): Promise<ServiceResult<Supplier[]>>;

  /**
   * Verifica si existe un proveedor con el nombre dado (tipado semántico)
   * @param name - Nombre a verificar
   * @returns true si existe
   */
  existsByName(name: SupplierName | string): Promise<boolean>;

  /**
   * Verifica si existe un proveedor con el email dado (tipado semántico)
   * @param email - Email a verificar
   * @returns true si existe
   */
  existsByEmail(email: SupplierEmail | string): Promise<boolean>;

  /**
   * Obtiene estadísticas de proveedores
   * @returns Estadísticas de proveedores
   */
  getStats(): Promise<
    ServiceResult<{
      totalSuppliers: number;
      activeSuppliers: number;
      suppliersWithCompleteContact: number;
    }>
  >;

  /**
   * Obtiene el historial de auditoría de un proveedor
   * @param supplierId - ID del proveedor
   * @returns Lista de logs de auditoría del proveedor
   */
  getAuditTrail(
    supplierId: number
  ): Promise<ServiceResult<AuditLog<ISupplier>[]>>;
}
