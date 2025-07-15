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
    try {
      const validatedData = validateFn(req.body);
      const result = await executeFn(validatedData);
      res
        .status(201)
        .json(
          buildCreatedResponse(result, this.config.successMessages.created)
        );
    } catch (error) {
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
    executeFn: (id: number) => Promise<void>
  ): Promise<void> {
    try {
      const id = Number(req.params.id);
      await executeFn(id);
      res
        .status(200)
        .json(
          buildSuccessResponse(this.config.successMessages.deleted, { id })
        );
    } catch (error) {
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
    const message =
      error instanceof Error ? error.message : 'Error desconocido';
    res.status(400).json(buildErrorResponse(`Error en ${method}`, message));
  }
}
