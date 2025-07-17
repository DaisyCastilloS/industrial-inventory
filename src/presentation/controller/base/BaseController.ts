import { Request, Response } from 'express';
import {
  buildSuccessResponse,
  buildCreatedResponse,
  buildErrorResponse,
} from '../../utils/ResponseHelper';

export interface BaseControllerConfig {
  entityName: string;
  successMessages: {
    created: string;
    found: string;
    listed: string;
    updated: string;
    deleted: string;
  };
}

export abstract class BaseController {
  protected config: BaseControllerConfig;

  constructor(config: BaseControllerConfig) {
    this.config = config;
  }

  protected async handleCreate<TInput, TOutput>(
    req: Request,
    res: Response,
    validateFn: (data: any) => TInput,
    executeFn: (data: TInput) => Promise<TOutput>
  ): Promise<void> {
    console.log('DEBUG: BaseController.handleCreate - req.body:', JSON.stringify(req.body, null, 2));
    try {
      const validatedData = validateFn(req.body);
      console.log('DEBUG: BaseController.handleCreate - validatedData:', JSON.stringify(validatedData, null, 2));
      const result = await executeFn(validatedData);
      res
        .status(201)
        .json(
          buildCreatedResponse(result, this.config.successMessages.created)
        );
    } catch (error) {
      console.log('DEBUG: BaseController.handleCreate - error:', error);
      this.handleError(error, req, res, 'create');
    }
  }

  protected async handleGetById<TOutput>(
    req: Request,
    res: Response,
    executeFn: (id: number) => Promise<TOutput>
  ): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(
          buildErrorResponse('ID inválido', 'El ID debe ser un número válido')
        );
        return;
      }
      
      const result = await executeFn(id);
      res
        .status(200)
        .json(buildSuccessResponse(this.config.successMessages.found, result));
    } catch (error) {
      this.handleError(error, req, res, 'getById');
    }
  }

  protected async handleList<TOutput>(
    req: Request,
    res: Response,
    executeFn: (params?: any) => Promise<TOutput>
  ): Promise<void> {
    try {
      const params = this.extractListParams(req);
      const result = await executeFn(params);
      res
        .status(200)
        .json(buildSuccessResponse(this.config.successMessages.listed, result));
    } catch (error) {
      this.handleError(error, req, res, 'list');
    }
  }

  protected async handleUpdate<TInput, TOutput>(
    req: Request,
    res: Response,
    validateFn: (data: any) => TInput,
    executeFn: (id: number, data: TInput) => Promise<TOutput>
  ): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(
          buildErrorResponse('ID inválido', 'El ID debe ser un número válido')
        );
        return;
      }
      
      const validatedData = validateFn(req.body);
      const result = await executeFn(id, validatedData);
      res
        .status(200)
        .json(
          buildSuccessResponse(this.config.successMessages.updated, result)
        );
    } catch (error) {
      this.handleError(error, req, res, 'update');
    }
  }

  protected async handleDelete(
    req: Request,
    res: Response,
    executeFn: (id: number) => Promise<any>
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json(
          buildErrorResponse('ID inválido', 'El ID debe ser un número válido')
        );
        return;
      }

      const result = await executeFn(id);
      
      if (!result) {
        res.status(404).json(
          buildErrorResponse('Recurso no encontrado', `No se encontró el recurso con ID ${id}`)
        );
        return;
      }

      res
        .status(200)
        .json(buildSuccessResponse(this.config.successMessages.deleted, result));
    } catch (error) {
      // Si el error indica que no se encontró el recurso, devolver 404
      if (error instanceof Error && error.message.includes('not found')) {
        const id = parseInt(req.params.id);
        res.status(404).json(
          buildErrorResponse('Recurso no encontrado', `No se encontró el recurso con ID ${id}`)
        );
        return;
      }
      
      this.handleError(error, req, res, 'delete');
    }
  }

  protected extractListParams(req: Request): any {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    return { page, limit };
  }

  protected handleError(
    error: any,
    req: Request,
    res: Response,
    method: string
  ): void {
    let statusCode = 400;
    let message = 'Error desconocido';
    
    if (error instanceof Error) {
      message = error.message;
      
      // Determinar el código de estado basado en el tipo de error
      if (message.includes('not found') || message.includes('no encontrado')) {
        statusCode = 404;
      } else if (message.includes('validation') || message.includes('Validation error')) {
        statusCode = 400;
      } else if (message.includes('unauthorized') || message.includes('permission')) {
        statusCode = 403;
      } else if (message.includes('conflict') || message.includes('duplicate')) {
        statusCode = 409;
      } else if (message.includes('internal') || message.includes('database')) {
        statusCode = 500;
      }
    }
    
    res.status(statusCode).json(buildErrorResponse(`Error en ${method}`, message));
  }
}
