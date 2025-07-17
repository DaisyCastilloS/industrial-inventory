/**
 * Generic DTO mapper utility to reduce code duplication
 * @author Daisy Castillo
 */

import { BaseEntity as DomainBaseEntity } from '../../domain/entity/base/BaseEntity';

export interface BaseEntity extends DomainBaseEntity {
  toJSON(): any;
}

export interface BaseResponseDTO {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  [key: string]: any; // Allow additional properties
}

export class DTOMapper {
  /**
   * Maps a base entity to a response DTO with common fields
   */
  static mapBaseEntity<T extends BaseEntity, R extends BaseResponseDTO>(
    entity: T,
    additionalFields: Partial<R> = {}
  ): R {
    // Use toJSON to get the public representation
    const entityData = entity.toJSON();

    if (!entityData.id) {
      throw new Error(
        'Entity missing required field: id'
      );
    }

    return {
      id: entityData.id,
      createdAt: entityData.createdAt,
      updatedAt: entityData.updatedAt,
      isActive: entityData.isActive ?? true,
      ...additionalFields,
    } as R;
  }

  /**
   * Maps an array of entities to response DTOs
   */
  static mapEntities<T extends BaseEntity, R extends BaseResponseDTO>(
    entities: T[],
    mapperFn: (entity: T) => Partial<R>
  ): R[] {
    return entities.map(entity => this.mapBaseEntity(entity, mapperFn(entity)));
  }

  /**
   * Creates a paginated response
   */
  static createPaginatedResponse<T>(
    items: T[],
    total: number,
    page: number = 1,
    limit: number = 10
  ) {
    const totalPages = Math.ceil(total / limit);
    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Validates entity has required fields
   */
  static validateEntity(entity: BaseEntity): boolean {
    const entityData = entity.toJSON();
    return !!entityData.id;
  }

  /**
   * Filters entities to only include valid ones
   */
  static filterValidEntities<T extends BaseEntity>(entities: T[]): T[] {
    return entities.filter(entity => this.validateEntity(entity));
  }

  /**
   * Maps any entity to a response DTO
   */
  static mapToResponseDTO<T extends BaseEntity, R extends BaseResponseDTO>(
    entity: T,
    dtoClass: new () => R
  ): R {
    const dto = new dtoClass();
    const entityData = entity.toJSON();
    return { ...dto, ...entityData };
  }

  /**
   * Maps a Supplier entity to SupplierResponseDTO
   */
  static mapSupplierToResponseDTO(supplier: BaseEntity): any {
    return this.mapBaseEntity(supplier, {
      name: supplier.toJSON().name,
      description: supplier.toJSON().description ?? null,
      contactPerson: supplier.toJSON().contactPerson ?? null,
      email: supplier.toJSON().email ?? null,
      phone: supplier.toJSON().phone ?? null,
      address: supplier.toJSON().address ?? null,
    });
  }

  /**
   * Maps a Location entity to LocationResponseDTO
   */
  static mapLocationToResponseDTO(location: BaseEntity): any {
    return this.mapBaseEntity(location, {
      name: location.toJSON().name,
      description: location.toJSON().description ?? null,
      zone: location.toJSON().zone ?? null,
      shelf: location.toJSON().shelf ?? null,
      capacity: location.toJSON().capacity ?? null,
      currentUsage: location.toJSON().currentUsage ?? null,
    });
  }

  /**
   * Maps a User entity to UserResponseDTO
   */
  static mapUserToResponseDTO(user: BaseEntity): any {
    return this.mapBaseEntity(user, {
      email: user.toJSON().email,
      name: user.toJSON().name,
      role: user.toJSON().role,
      // No incluir password
    });
  }

  /**
   * Maps a Category entity to CategoryResponseDTO
   */
  static mapCategoryToResponseDTO(category: BaseEntity): any {
    return this.mapBaseEntity(category, {
      name: category.toJSON().name,
      description: category.toJSON().description ?? null,
      parentId: category.toJSON().parentId ?? null,
    });
  }

  /**
   * Maps a ProductMovement entity to ProductMovementResponseDTO
   */
  static mapProductMovementToResponseDTO(movement: BaseEntity): any {
    const data = movement.toJSON();
    return {
      id: data.id,
      productId: data.productId,
      movementType: String(data.movementType),
      quantity: data.quantity,
      previousQuantity: data.previousQuantity,
      newQuantity: data.newQuantity,
      reason: data.reason ?? null,
      userId: data.userId,
      createdAt: data.createdAt,
    };
  }
}
