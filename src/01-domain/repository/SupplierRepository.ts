/**
 * @fileoverview Interfaz del repositorio de proveedores
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { Supplier, ISupplier } from '../entity/Supplier';

/**
 * Interfaz del repositorio de proveedores
 */
export interface ISupplierRepository {
  /**
   * Crea un nuevo proveedor
   * @param supplier - Datos del proveedor
   * @returns Proveedor creado
   */
  create(supplier: ISupplier): Promise<Supplier>;

  /**
   * Busca un proveedor por ID
   * @param id - ID del proveedor
   * @returns Proveedor encontrado o null
   */
  findById(id: number): Promise<Supplier | null>;

  /**
   * Busca un proveedor por nombre
   * @param name - Nombre del proveedor
   * @returns Proveedor encontrado o null
   */
  findByName(name: string): Promise<Supplier | null>;

  /**
   * Busca un proveedor por email
   * @param email - Email del proveedor
   * @returns Proveedor encontrado o null
   */
  findByEmail(email: string): Promise<Supplier | null>;

  /**
   * Obtiene todos los proveedores
   * @returns Lista de proveedores
   */
  findAll(): Promise<Supplier[]>;

  /**
   * Obtiene proveedores activos
   * @returns Lista de proveedores activos
   */
  findActive(): Promise<Supplier[]>;

  /**
   * Busca proveedores por persona de contacto
   * @param contactPerson - Persona de contacto
   * @returns Lista de proveedores que coinciden
   */
  findByContactPerson(contactPerson: string): Promise<Supplier[]>;

  /**
   * Busca proveedores con información de contacto completa
   * @returns Lista de proveedores con contacto completo
   */
  findWithCompleteContact(): Promise<Supplier[]>;

  /**
   * Actualiza un proveedor
   * @param id - ID del proveedor
   * @param supplierData - Datos a actualizar
   * @returns Proveedor actualizado
   */
  update(id: number, supplierData: Partial<ISupplier>): Promise<Supplier>;

  /**
   * Elimina un proveedor (soft delete)
   * @param id - ID del proveedor
   */
  delete(id: number): Promise<void>;

  /**
   * Activa un proveedor
   * @param id - ID del proveedor
   * @returns Proveedor activado
   */
  activate(id: number): Promise<Supplier>;

  /**
   * Desactiva un proveedor
   * @param id - ID del proveedor
   * @returns Proveedor desactivado
   */
  deactivate(id: number): Promise<Supplier>;

  /**
   * Verifica si existe un proveedor con el nombre dado
   * @param name - Nombre a verificar
   * @returns true si existe
   */
  existsByName(name: string): Promise<boolean>;

  /**
   * Verifica si existe un proveedor con el email dado
   * @param email - Email a verificar
   * @returns true si existe
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Obtiene estadísticas de proveedores
   * @returns Estadísticas de proveedores
   */
  getStats(): Promise<{
    totalSuppliers: number;
    activeSuppliers: number;
    suppliersWithCompleteContact: number;
  }>;

  /**
   * Obtiene el historial de auditoría de un proveedor
   * @param supplierId - ID del proveedor
   * @returns Lista de logs de auditoría
   */
  getAuditTrail(supplierId: number): Promise<any[]>;
} 