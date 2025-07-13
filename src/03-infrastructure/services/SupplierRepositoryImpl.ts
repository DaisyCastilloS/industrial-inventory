/**
 * @fileoverview Implementación del repositorio de proveedores
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { pool } from "../db/database";
import { Supplier, ISupplier } from "../../01-domain/entity/Supplier";
import { ISupplierRepository } from "../../01-domain/repository/SupplierRepository";

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
      const createdSupplier = new Supplier({
        id: result.rows[0].id,
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        isActive: supplier.isActive,
        createdAt: supplier.createdAt || new Date(),
        updatedAt: supplier.updatedAt || new Date()
      });
      return createdSupplier;
    }
    
    throw new Error('Error al crear proveedor');
  }

  async findById(id: number): Promise<Supplier | null> {
    const result = await pool.query(SupplierQueries.findById, [id]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
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

  async findByName(name: string): Promise<Supplier | null> {
    const result = await pool.query(SupplierQueries.findByName, [name]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
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

  async findByEmail(email: string): Promise<Supplier | null> {
    const result = await pool.query(SupplierQueries.findByEmail, [email]);
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
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

  async findAll(): Promise<Supplier[]> {
    const result = await pool.query(SupplierQueries.findAll);
    return result.rows.map(row => new Supplier({
      id: row.id,
      name: row.name,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      address: row.address,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async findActive(): Promise<Supplier[]> {
    const result = await pool.query(SupplierQueries.findActive);
    return result.rows.map(row => new Supplier({
      id: row.id,
      name: row.name,
      contactPerson: row.contact_person,
      email: row.email,
      phone: row.phone,
      address: row.address,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
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

    return new Supplier({
      id,
      ...updatedData,
      createdAt: existingSupplier.createdAt
    });
  }

  async delete(id: number): Promise<void> {
    const result = await pool.query(SupplierQueries.delete, [id]);
    if (result.rowCount === 0) {
      throw new Error(`Proveedor con ID ${id} no encontrado`);
    }
  }

  async existsByName(name: string): Promise<boolean> {
    const result = await pool.query(SupplierQueries.existsByName, [name]);
    return parseInt(result.rows[0].count) > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await pool.query(SupplierQueries.existsByEmail, [email]);
    return parseInt(result.rows[0].count) > 0;
  }

  async getAuditTrail(supplierId: number): Promise<any[]> {
    const result = await pool.query(SupplierQueries.getAuditTrail, [supplierId]);
    return result.rows;
  }

  async activate(id: number): Promise<Supplier> {
    const supplier = await this.findById(id);
    if (!supplier) {
      throw new Error(`Proveedor con ID ${id} no encontrado`);
    }

    supplier.activate();
    return this.update(id, { isActive: true });
  }

  async deactivate(id: number): Promise<Supplier> {
    const supplier = await this.findById(id);
    if (!supplier) {
      throw new Error(`Proveedor con ID ${id} no encontrado`);
    }

    supplier.deactivate();
    return this.update(id, { isActive: false });
  }
} 