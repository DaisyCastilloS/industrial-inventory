
import { BaseCreateUseCase } from '../../base/BaseUseCase';
import { ProductMovementRepositoryImpl } from '../../../../infrastructure/services/ProductMovementRepositoryImpl';
import { ProductRepositoryImpl } from '../../../../infrastructure/services/ProductRepositoryImpl';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import {
  CreateProductMovementDTO,
  CreateProductMovementWithUserIdDTO,
  validateCreateProductMovement,
} from '../../dto/productMovement/CreateProductMovementDTO';
import { ProductMovementResponseDTO } from '../../dto/productMovement/ProductMovementResponseDTO';
import { ProductMovement } from '../../../domain/entity/ProductMovement';
import { ServiceResult } from '../../../../infrastructure/services/base/ServiceTypes';

export class CreateProductMovementUseCase extends BaseCreateUseCase<
  CreateProductMovementWithUserIdDTO,
  ProductMovement
> {
  constructor(
    private productMovementRepository: ProductMovementRepositoryImpl,
    private productRepository: ProductRepositoryImpl,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'CREATE_PRODUCT_MOVEMENT',
      entityName: 'Movimiento de Producto',
    });
  }

  protected async validateCreateInput(input: CreateProductMovementWithUserIdDTO): Promise<void> {
    // Validar solo los campos del DTO base (sin user_id)
    const { user_id, ...baseData } = input;
    validateCreateProductMovement(baseData);
  }

  protected async validateCreatedEntity(entity: ProductMovement): Promise<void> {
    if (!entity || !entity.id) {
      throw new Error('Error al crear el movimiento de producto');
    }
  }

  protected async performCreate(
    data: CreateProductMovementWithUserIdDTO
  ): Promise<ServiceResult<ProductMovement>> {
    try {
      this.logger.info(`[CREATE_PRODUCT_MOVEMENT] Iniciando creación con datos:`, data);
      
      // Obtener el producto para calcular las cantidades
      this.logger.info(`[CREATE_PRODUCT_MOVEMENT] Buscando producto con ID: ${data.product_id}`);
      const productResult = await this.productRepository.findById(data.product_id);
      this.logger.info(`[CREATE_PRODUCT_MOVEMENT] Resultado de búsqueda de producto:`, productResult);
      
      if (!productResult.success || !productResult.data) {
        this.logger.error(`[CREATE_PRODUCT_MOVEMENT] Producto no encontrado: ${data.product_id}`);
        throw new Error('Producto no encontrado');
      }

      const currentQuantity = productResult.data.quantity || 0;
      this.logger.info(`[CREATE_PRODUCT_MOVEMENT] Cantidad actual del producto: ${currentQuantity}`);
      
      let newQuantity: number;
      
      // Calcular la nueva cantidad según el tipo de movimiento
      switch (data.movement_type) {
        case 'IN':
          newQuantity = currentQuantity + data.quantity;
          this.logger.info(`[CREATE_PRODUCT_MOVEMENT] Movimiento IN: ${currentQuantity} + ${data.quantity} = ${newQuantity}`);
          break;
        case 'OUT':
          newQuantity = currentQuantity - data.quantity;
          this.logger.info(`[CREATE_PRODUCT_MOVEMENT] Movimiento OUT: ${currentQuantity} - ${data.quantity} = ${newQuantity}`);
          if (newQuantity < 0) {
            this.logger.error(`[CREATE_PRODUCT_MOVEMENT] Stock insuficiente: ${newQuantity}`);
            throw new Error('No hay suficiente stock para este movimiento');
          }
          break;
        case 'ADJUSTMENT':
          newQuantity = data.quantity; // Para ajustes, usar la cantidad directamente
          this.logger.info(`[CREATE_PRODUCT_MOVEMENT] Movimiento ADJUSTMENT: nueva cantidad = ${newQuantity}`);
          break;
        default:
          this.logger.error(`[CREATE_PRODUCT_MOVEMENT] Tipo de movimiento inválido: ${data.movement_type}`);
          throw new Error('Tipo de movimiento no válido');
      }

      const movementData = {
        productId: data.product_id,
        movementType: data.movement_type,
        quantity: data.quantity,
        previousQuantity: currentQuantity,
        newQuantity: newQuantity,
        reason: data.reason,
        userId: data.user_id,
        isActive: true
      };
      
      this.logger.info(`[CREATE_PRODUCT_MOVEMENT] Datos del movimiento a crear:`, movementData);
      console.log('[DEBUG] movementData antes de crear ProductMovement:', movementData);

      this.logger.info(`[CREATE_PRODUCT_MOVEMENT] Creando entidad ProductMovement...`);
      const movement = new ProductMovement(movementData);
      this.logger.info(`[CREATE_PRODUCT_MOVEMENT] Entidad creada exitosamente:`, movement.toJSON());

      this.logger.info(`[CREATE_PRODUCT_MOVEMENT] Guardando en repositorio...`);
      const result = await this.productMovementRepository.create(movement);
      this.logger.info(`[CREATE_PRODUCT_MOVEMENT] Resultado del repositorio:`, result);
      
      if (!result.success) {
        this.logger.error(`[CREATE_PRODUCT_MOVEMENT] Error en repositorio:`, result.error);
        throw result.error || new Error('Error al guardar el movimiento');
      }
      
      this.logger.info(`[CREATE_PRODUCT_MOVEMENT] Movimiento creado exitosamente`);
      return result;
    } catch (error) {
      this.logger.error(`[CREATE_PRODUCT_MOVEMENT] Error durante la creación:`, error as any);
      throw error;
    }
  }

  public mapToDTO(movement: ProductMovement): ProductMovementResponseDTO {
    return {
      id: movement.id || 0,
      productId: movement.productId,
      userId: movement.userId,
      movementType: movement.movementType,
      quantity: movement.quantity,
      previousQuantity: movement.previousQuantity,
      newQuantity: movement.newQuantity,
      reason: movement.reason || null,
      createdAt: movement.createdAt || new Date(),
    };
  }
}
