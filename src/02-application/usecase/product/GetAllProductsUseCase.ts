/**
 * @fileoverview Caso de uso para obtener todos los productos
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { IProductRepository } from '../../../01-domain/repository/ProductRepository';
import { Product } from '../../../01-domain/entity/Product';

/**
 * Caso de uso para obtener todos los productos
 */
export class GetAllProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  /**
   * Obtiene todos los productos registrados en el sistema.
   * @returns Array de entidades Product
   */
  async execute(): Promise<Product[]> {
    return this.productRepository.findAll();
  }
}