/**
 * @fileoverview Implementación de infraestructura del repositorio de proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { pool } from "../db/database";
import { Supplier, ISupplier, SupplierName, SupplierEmail, ContactPerson } from "../../01-domain/entity/Supplier";
import { ISupplierRepository } from "../../01-domain/repository/SupplierRepository";
import { AuditLog } from "../../01-domain/entity/AuditLog";

/**
 * Consultas SQL para proveedores
 */
const SupplierQueries = {
  create: `
    INSERT INTO suppliers (name, contact_person, email, phone, address, is_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `,
  
  findById: `
    SELECT * FROM suppliers WHERE id = $1
  `,
  
  findByName: `
    SELECT * FROM suppliers WHERE name = $1
  `,
  
  findByEmail: `
    SELECT * FROM suppliers WHERE email = $1
  `,
  
  findAll: `
    SELECT * FROM suppliers ORDER BY created_at DESC
  `,
  
  findActive: `
    SELECT * FROM suppliers WHERE is_active = true ORDER BY created_at DESC
  `,
  
  update: `
    UPDATE suppliers 
    SET name = $1, contact_person = $2, email = $3, phone = $4, address = $5, is_active = $6, updated_at = $7
    WHERE id = $8
  `,
  
  delete: `
    DELETE FROM suppliers WHERE id = $1
  `,
  
  existsByName: `
    SELECT COUNT(*) FROM suppliers WHERE name = $1
  `,
  
  existsByEmail: `
    SELECT COUNT(*) FROM suppliers WHERE email = $1
  `,
  
  getAuditTrail: `
    SELECT * FROM audit_logs 
    WHERE table_name = 'suppliers' AND record_id = $1 
    ORDER BY created_at DESC
  `
};

/**
 * Implementación del repositorio de proveedores
 */
export class SupplierRepositoryImpl implements ISupplierRepository {
  /**
   * Crea un nuevo proveedor en la base de datos
   * @param supplier - Datos del proveedor
   * @returns Proveedor creado
   */
  async create(supplier: ISupplier): Promise<Supplier> {
    const result = await pool.query(SupplierQueries.create, [
      supplier.name,
      supplier.contactPerson,
      supplier.email,
      supplier.phone,
      supplier.address,
      supplier.isActive,
      supplier.createdAt || new Date(),
      supplier.updatedAt || new Date()
    ]);
    if (result.rows.length > 0) {
      return this.mapRowToSupplier(result.rows[0]);
    }
    throw new Error('Error al crear proveedor');
  }

  /**
   * Busca un proveedor por ID
   * @param id - ID del proveedor
   * @returns Proveedor encontrado o null
   */
  async findById(id: number): Promise<Supplier | null> {
    const result = await pool.query(SupplierQueries.findById, [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToSupplier(result.rows[0]);
  }

  /**
   * Busca un proveedor por nombre (tipado semántico)
   * @param name - Nombre del proveedor
   * @returns Proveedor encontrado o null
   */
  async findByName(name: SupplierName | string): Promise<Supplier | null> {
    const result = await pool.query(SupplierQueries.findByName, [name]);
    if (result.rows.length === 0) return null;
    return this.mapRowToSupplier(result.rows[0]);
  }

  /**
   * Busca un proveedor por email (tipado semántico)
   * @param email - Email del proveedor
   * @returns Proveedor encontrado o null
   */
  async findByEmail(email: SupplierEmail | string): Promise<Supplier | null> {
    const result = await pool.query(SupplierQueries.findByEmail, [email]);
    if (result.rows.length === 0) return null;
    return this.mapRowToSupplier(result.rows[0]);
  }

  /**
   * Obtiene todos los proveedores
   * @returns Lista de proveedores
   */
  async findAll(): Promise<Supplier[]> {
    const result = await pool.query(SupplierQueries.findAll);
    return result.rows.map(this.mapRowToSupplier);
  }

  /**
   * Obtiene proveedores activos
   * @returns Lista de proveedores activos
   */
  async findActive(): Promise<Supplier[]> {
    const result = await pool.query(SupplierQueries.findActive);
    return result.rows.map(this.mapRowToSupplier);
  }

  async update(id: number, supplierData: Partial<ISupplier>): Promise<Supplier> {
    const existingSupplier = await this.findById(id);
    if (!existingSupplier) {
      throw new Error(`Proveedor con ID ${id} no encontrado`);
    }
    const updatedData = {
      name: supplierData.name || existingSupplier.name,
      contactPerson: supplierData.contactPerson || existingSupplier.contactPerson,
      email: supplierData.email || existingSupplier.email,
      phone: supplierData.phone || existingSupplier.phone,
      address: supplierData.address || existingSupplier.address,
      isActive: supplierData.isActive !== undefined ? supplierData.isActive : existingSupplier.isActive,
      updatedAt: new Date()
    };
    await pool.query(SupplierQueries.update, [
      updatedData.name,
      updatedData.contactPerson,
      updatedData.email,
      updatedData.phone,
      updatedData.address,
      updatedData.isActive,
      updatedData.updatedAt,
      id
    ]);
    return await this.findById(id) as Supplier;
  }

  async delete(id: number): Promise<void> {
    const result = await pool.query(SupplierQueries.delete, [id]);
    if (result.rowCount === 0) {
      throw new Error(`Proveedor con ID ${id} no encontrado`);
    }
  }

  /**
   * Verifica si existe un proveedor con el nombre dado (tipado semántico)
   * @param name - Nombre a verificar
   * @returns true si existe
   */
  async existsByName(name: SupplierName | string): Promise<boolean> {
    const result = await pool.query(SupplierQueries.existsByName, [name]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Verifica si existe un proveedor con el email dado (tipado semántico)
   * @param email - Email a verificar
   * @returns true si existe
   */
  async existsByEmail(email: SupplierEmail | string): Promise<boolean> {
    const result = await pool.query(SupplierQueries.existsByEmail, [email]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Obtiene el historial de auditoría de un proveedor
   * @param supplierId - ID del proveedor
   * @returns Lista de logs de auditoría del proveedor
   */
  async getAuditTrail(supplierId: number): Promise<AuditLog<ISupplier>[]> {
    const result = await pool.query(SupplierQueries.getAuditTrail, [supplierId]);
    return result.rows.map((row: any) => new AuditLog<ISupplier>(row));
  }

  async findByContactPerson(contactPerson: ContactPerson | string): Promise<Supplier[]> {
    const result = await pool.query(
      `SELECT * FROM suppliers WHERE contact_person = $1 AND is_active = true`,
      [contactPerson]
    );
    return result.rows.map(this.mapRowToSupplier);
  }

  async findWithCompleteContact(): Promise<Supplier[]> {
    const result = await pool.query(
      `SELECT * FROM suppliers WHERE email IS NOT NULL AND phone IS NOT NULL AND contact_person IS NOT NULL AND is_active = true`
    );
    return result.rows.map(this.mapRowToSupplier);
  }

  async activate(id: number): Promise<Supplier> {
    return this.update(id, { isActive: true });
  }

  async deactivate(id: number): Promise<Supplier> {
    return this.update(id, { isActive: false });
  }

  async getStats(): Promise<{
    totalSuppliers: number;
    activeSuppliers: number;
    suppliersWithCompleteContact: number;
  }> {
    const result = await pool.query(
      `SELECT COUNT(*) as total_suppliers,
              COUNT(CASE WHEN is_active = true THEN 1 END) as active_suppliers,
              COUNT(CASE WHEN email IS NOT NULL AND phone IS NOT NULL AND contact_person IS NOT NULL AND is_active = true THEN 1 END) as suppliers_with_complete_contact
       FROM suppliers`
    );
    const stats = result.rows[0];
    return {
      totalSuppliers: parseInt(stats.total_suppliers),
      activeSuppliers: parseInt(stats.active_suppliers),
      suppliersWithCompleteContact: parseInt(stats.suppliers_with_complete_contact)
    };
  }

  // --- Método privado para mapear una fila de la BD a la entidad Supplier ---
  private mapRowToSupplier(row: any): Supplier {
    return new Supplier({
      id: row.id,
      name: row.name,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      address: row.address,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
} 