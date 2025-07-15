/**
 * Generic DTO mapper utility to reduce code duplication
 * @author Daisy Castillo
 */

export interface BaseEntity {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
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
    if (!entity.id || !entity.createdAt || !entity.updatedAt) {
      throw new Error(
        'Entity missing required fields: id, createdAt, or updatedAt'
      );
    }

    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      isActive: entity.isActive ?? true,
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
    page: number,
    limit: number
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
    return !!(entity.id && entity.createdAt && entity.updatedAt);
  }

  /**
   * Filters entities to only include valid ones
   */
  static filterValidEntities<T extends BaseEntity>(entities: T[]): T[] {
    return entities.filter(entity => this.validateEntity(entity));
  }

  /**
   * Maps a Supplier entity to SupplierResponseDTO
   */
  static mapSupplierToResponseDTO(supplier: any): any {
    return this.mapBaseEntity(supplier, {
      name: supplier.name,
      description: supplier.description ?? null,
      contactPerson: supplier.contactPerson ?? null,
      email: supplier.email ?? null,
      phone: supplier.phone ?? null,
      address: supplier.address ?? null,
    });
  }

  /**
   * Maps a Location entity to LocationResponseDTO
   */
  static mapLocationToResponseDTO(location: any): any {
    return this.mapBaseEntity(location, {
      name: location.name,
      description: location.description ?? null,
      code: location.code ?? null,
      type: location.type ?? null,
      parentId: location.parentId ?? null,
    });
  }

  /**
   * Maps a User entity to UserResponseDTO
   */
  static mapUserToResponseDTO(user: any): any {
    return this.mapBaseEntity(user, {
      email: user.email,
      name: user.name,
      role: user.role,
      // No incluir password
    });
  }

  /**
   * Maps a Category entity to CategoryResponseDTO
   */
  static mapCategoryToResponseDTO(category: any): any {
    return this.mapBaseEntity(category, {
      name: category.name,
      description: category.description ?? null,
      parentId: category.parentId ?? null,
    });
  }

  /**
   * Maps a ProductMovement entity to ProductMovementResponseDTO
   */
  static mapProductMovementToResponseDTO(movement: any): any {
    return {
      id: movement.id,
      productId: movement.productId,
      movementType: String(movement.movementType),
      quantity: movement.quantity,
      previousQuantity: movement.previousQuantity,
      newQuantity: movement.newQuantity,
      reason: movement.reason ?? null,
      userId: movement.userId,
      createdAt: movement.createdAt,
    };
  }
}
