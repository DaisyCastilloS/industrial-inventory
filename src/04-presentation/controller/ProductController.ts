import { Request, Response } from 'express';
import { CreateProductUseCase } from '../../02-application/usecase/product/CreateProductUseCase';
import { ListProductsUseCase } from '../../02-application/usecase/product/ListProductsUseCase';
import { GetProductByIdUseCase } from '../../02-application/usecase/product/GetProductByIdUseCase';
import { UpdateProductUseCase } from '../../02-application/usecase/product/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../02-application/usecase/product/DeleteProductUseCase';
import { LoggerWrapperInterface } from '../../02-application/interface/LoggerWrapperInterface';
import { ProductRepository } from '../../01-domain/repository/ProductRepository';
import { 
  ProductNotFoundError, 
  ProductAlreadyExistsError, 
  ProductValidationError 
} from '../../01-domain/entity/ProductErrors';
import { validateCreateProductDTO } from '../../02-application/dto/product/CreateProductDTO';
import { validateUpdateProductPayload } from '../../02-application/dto/product/UpdateProductDTO';
import { 
  buildSuccessResponse, 
  buildErrorResponse, 
  buildCreatedResponse, 
  buildUpdatedResponse, 
  buildDeletedResponse,
  buildListResponse
} from '../utils/ResponseHelper';

/**
 * Controlador de productos refactorizado siguiendo Clean Architecture
 * Implementa la capa de presentación con validaciones robustas y manejo de errores centralizado
 */
export class ProductController {
  private readonly createProductUseCase: CreateProductUseCase;
  private readonly listProductsUseCase: ListProductsUseCase;
  private readonly getProductByIdUseCase: GetProductByIdUseCase;
  private readonly updateProductUseCase: UpdateProductUseCase;
  private readonly deleteProductUseCase: DeleteProductUseCase;

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly logger: LoggerWrapperInterface
  ) {
    // Inicializar Use Cases con inyección de dependencias
    this.createProductUseCase = new CreateProductUseCase(productRepository);
    this.listProductsUseCase = new ListProductsUseCase(productRepository, logger);
    this.getProductByIdUseCase = new GetProductByIdUseCase(productRepository);
    this.updateProductUseCase = new UpdateProductUseCase(productRepository);
    this.deleteProductUseCase = new DeleteProductUseCase(productRepository);
  }

  /**
   * Valida y parsea el ID del producto desde los parámetros de ruta
   * @param req - Request de Express
   * @returns ID del producto validado
   * @throws Error si el ID es inválido
   */
  private validateProductId(req: Request): number {
    const productId = Number(req.params.id);
    
    if (isNaN(productId) || productId <= 0) {
      throw new Error('Product ID must be a positive integer');
    }
    
    return productId;
  }

  /**
   * Maneja errores de manera centralizada y consistente
   * @param error - Error capturado
   * @param req - Request de Express
   * @param res - Response de Express
   * @param operation - Nombre de la operación para logging
   */
  private handleError(
    error: unknown, 
    req: Request, 
    res: Response, 
    operation: string
  ): void {
    // Log del error con contexto detallado
    this.logger.error(`❌ Error in ${operation}`, {
      error: error instanceof Error ? error.message : String(error),
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params
    });

    // Determinar tipo de error y construir respuesta apropiada
    if (error instanceof ProductValidationError) {
      const response = buildErrorResponse('Validation Error', error.message);
      res.status(400).json(response);
      return;
    }

    if (error instanceof ProductNotFoundError) {
      const response = buildErrorResponse('Not Found', error.message);
      res.status(404).json(response);
      return;
    }

    if (error instanceof ProductAlreadyExistsError) {
      const response = buildErrorResponse('Conflict', error.message);
      res.status(409).json(response);
      return;
    }

    // Error genérico para casos no manejados
    const response = buildErrorResponse(
      'Internal Server Error', 
      'An unexpected error occurred'
    );
    res.status(500).json(response);
  }

  /**
   * Crea un nuevo producto con validación robusta
   * @param req - Request de Express
   * @param res - Response de Express
   */
  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar datos de entrada con Zod
      const validatedData = validateCreateProductDTO(req.body);
      
      // Ejecutar caso de uso
      await this.createProductUseCase.execute(validatedData);
      
      // Construir respuesta exitosa
      const response = buildCreatedResponse(
        { message: 'Product created successfully' },
        'Product created successfully'
      );
      
      res.status(201).json(response);
      
      // Log de éxito
      this.logger.info('✅ Product created via API', {
        productName: validatedData.name,
        userAgent: req.get('User-Agent')
      });
      
    } catch (error) {
      this.handleError(error, req, res, 'createProduct');
    }
  };

  /**
   * Obtiene todos los productos con paginación opcional
   * @param req - Request de Express
   * @param res - Response de Express
   */
  getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      // Ejecutar caso de uso
      const products = await this.listProductsUseCase.execute();
      
      // Construir respuesta con metadata
      const response = buildListResponse(
        products,
        'Products retrieved successfully'
      );
      
      res.status(200).json(response);
      
      // Log de éxito
      this.logger.info('✅ Products retrieved via API', {
        count: products.length,
        userAgent: req.get('User-Agent')
      });
      
    } catch (error) {
      this.handleError(error, req, res, 'getAllProducts');
    }
  };

  /**
   * Obtiene un producto por ID con validación robusta
   * @param req - Request de Express
   * @param res - Response de Express
   */
  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar ID del producto
      const productId = this.validateProductId(req);
      
      // Ejecutar caso de uso
      const product = await this.getProductByIdUseCase.execute(productId);
      
      if (!product) {
        const response = buildErrorResponse(
          'Not Found',
          `Product with ID ${productId} not found`
        );
        res.status(404).json(response);
        return;
      }
      
      // Construir respuesta exitosa
      const response = buildSuccessResponse(
        'Product retrieved successfully',
        product
      );
      
      res.status(200).json(response);
      
      // Log de éxito
      this.logger.info('✅ Product retrieved via API', {
        productId,
        userAgent: req.get('User-Agent')
      });
      
    } catch (error) {
      this.handleError(error, req, res, 'getProductById');
    }
  };

  /**
   * Actualiza un producto existente con validación de roles y datos
   * @param req - Request de Express
   * @param res - Response de Express
   */
  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar ID del producto
      const productId = this.validateProductId(req);
      
      // Validar datos de actualización con Zod
      const validatedPayload = validateUpdateProductPayload(req.body);
      
      // Ejecutar caso de uso
      await this.updateProductUseCase.execute(productId, validatedPayload);
      
      // Construir respuesta exitosa
      const response = buildUpdatedResponse(
        productId,
        'Product updated successfully'
      );
      
      res.status(200).json(response);
      
      // Log de éxito
      this.logger.info('✅ Product updated via API', {
        productId,
        updatedFields: Object.keys(validatedPayload),
        userAgent: req.get('User-Agent')
      });
      
    } catch (error) {
      this.handleError(error, req, res, 'updateProduct');
    }
  };

  /**
   * Elimina un producto con validación robusta
   * @param req - Request de Express
   * @param res - Response de Express
   */
  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar ID del producto
      const productId = this.validateProductId(req);
      
      // Ejecutar caso de uso
      await this.deleteProductUseCase.execute(productId);
      
      // Construir respuesta exitosa
      const response = buildDeletedResponse(
        productId,
        'Product deleted successfully'
      );
      
      res.status(200).json(response);
      
      // Log de éxito
      this.logger.info('✅ Product deleted via API', {
        productId,
        userAgent: req.get('User-Agent')
      });
      
    } catch (error) {
      this.handleError(error, req, res, 'deleteProduct');
    }
  };
}