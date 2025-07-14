/**
 * @fileoverview Caso de uso para listar proveedores
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { ISupplierRepository } from '../../../01-domain/repository/SupplierRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ListSuppliersResponseDTO } from '../../dto/supplier/ListSuppliersResponseDTO';
import { SupplierResponseDTO } from '../../dto/supplier/SupplierResponseDTO';

/**
 * Caso de uso para listar proveedores
 */
export class ListSuppliersUseCase {
  constructor(
    private supplierRepository: ISupplierRepository,
    private logger: LoggerWrapperInterface
  ) {}

  /**
   * Ejecuta el caso de uso para listar todos los proveedores.
   * @param page - Página actual (opcional, por defecto 1)
   * @param limit - Límite de resultados por página (opcional, por defecto 10)
   * @returns Respuesta paginada de proveedores (DTO)
   */
  async execute(page: number = 1, limit: number = 10): Promise<ListSuppliersResponseDTO> {
    try {
      const suppliers = await this.supplierRepository.findAll();
      // Validación estricta de campos obligatorios
      const validSuppliers = suppliers.filter(sup =>
        sup.id !== undefined &&
        sup.createdAt !== undefined &&
        sup.updatedAt !== undefined
      );
      if (validSuppliers.length !== suppliers.length) {
        throw new Error('Persistencia inconsistente: uno o más proveedores no tienen id, createdAt o updatedAt');
      }
      const total = validSuppliers.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginated = validSuppliers.slice(startIndex, endIndex);
      const supplierDTOs: SupplierResponseDTO[] = paginated.map(supplier => ({
        id: supplier.id!,
        name: supplier.name,
        description: supplier.description ?? null,
        contactPerson: supplier.contactPerson ?? null,
        email: supplier.email ?? null,
        phone: supplier.phone ?? null,
        address: supplier.address ?? null,
        isActive: supplier.isActive,
        createdAt: supplier.createdAt!,
        updatedAt: supplier.updatedAt!
      }));
      await this.logger.info('Lista de proveedores consultada exitosamente', {
        count: supplierDTOs.length,
        action: 'LIST_SUPPLIERS'
      });
      return {
        suppliers: supplierDTOs,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      await this.logger.error('Error al listar proveedores', {
        error: error instanceof Error ? error.message : 'Error desconocido',
        action: 'LIST_SUPPLIERS'
      });
      throw error;
    }
  }
} 