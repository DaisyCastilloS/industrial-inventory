import { ProductMovement, IProductMovement } from '../entity/ProductMovement';
import { MovementType } from '../../../shared/constants/RoleTypes';
import { AuditLog } from '../entity/AuditLog';
import type { MovementReason } from '../entity/ProductMovement';

export interface IProductMovementRepository {
  create(movement: IProductMovement): Promise<ProductMovement>;
  findById(id: number): Promise<ProductMovement | null>;
  findAll(): Promise<ProductMovement[]>;
  findByProduct(productId: number): Promise<ProductMovement[]>;
  findByUser(userId: number): Promise<ProductMovement[]>;
  findByType(movementType: MovementType): Promise<ProductMovement[]>;
  findByProductAndType(
    productId: number,
    movementType: MovementType
  ): Promise<ProductMovement[]>;
  findByReason(reason: MovementReason): Promise<ProductMovement[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<ProductMovement[]>;
  findRecent(limit?: number): Promise<ProductMovement[]>;
  getProductStats(productId: number): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    totalQuantity: number;
  }>;
  getUserStats(userId: number): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    uniqueProducts: number;
  }>;
  getAuditTrail(id: number): Promise<AuditLog[]>;
  getStats(): Promise<{
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    uniqueProducts: number;
    uniqueUsers: number;
  }>;
}
