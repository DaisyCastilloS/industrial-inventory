/**
 * @fileoverview Tipos para campos editables de productos
 * @author Industrial Inventory System
 * @version 1.0.0
 */

/**
 * Campos editables de un producto
 */
export type EditableProductFields =
  | 'name'
  | 'description'
  | 'sku'
  | 'price'
  | 'quantity'
  | 'criticalStock'
  | 'categoryId'
  | 'locationId'
  | 'supplierId'
  | 'isActive';

/**
 * Campos requeridos para crear un producto
 */
export type RequiredProductFields = 'name' | 'sku' | 'price' | 'categoryId';

/**
 * Campos opcionales para crear un producto
 */
export type OptionalProductFields =
  | 'description'
  | 'quantity'
  | 'criticalStock'
  | 'locationId'
  | 'supplierId'
  | 'isActive';

/**
 * Campos que requieren validación especial
 */
export type ValidatedProductFields =
  | 'sku' // Debe ser único
  | 'price' // Debe ser positivo
  | 'quantity' // Debe ser no negativo
  | 'criticalStock' // Debe ser no negativo
  | 'categoryId' // Debe existir
  | 'locationId' // Debe existir si se proporciona
  | 'supplierId'; // Debe existir si se proporciona

/**
 * Campos que afectan el stock
 */
export type StockAffectingFields = 'quantity' | 'criticalStock';

/**
 * Campos que afectan el precio
 */
export type PriceAffectingFields = 'price';

/**
 * Campos que afectan la categorización
 */
export type CategorizationFields = 'categoryId' | 'locationId' | 'supplierId';

/**
 * Campos que afectan la visibilidad
 */
export type VisibilityFields = 'isActive';

/**
 * Campos que requieren auditoría especial
 */
export type AuditSensitiveFields =
  | 'price'
  | 'quantity'
  | 'criticalStock'
  | 'isActive';
