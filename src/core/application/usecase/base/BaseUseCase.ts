import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

export interface BaseUseCaseConfig {
  action: string;
  entityName: string;
}

export abstract class BaseUseCase<TInput, TOutput> {
  constructor(
    protected logger: LoggerWrapperInterface,
    protected config: BaseUseCaseConfig
  ) {}

  async execute(input: TInput): Promise<TOutput> {
    try {
      const result = await this.executeInternal(input);
      await this.logSuccess(input, result);
      return result;
    } catch (error) {
      await this.logError(error, input);
      throw error;
    }
  }

  protected abstract executeInternal(input: TInput): Promise<TOutput>;

  protected async logSuccess(input: TInput, result: TOutput): Promise<void> {
    await this.logger.info(`${this.config.entityName} operación exitosa`, {
      action: this.config.action,
      input: this.sanitizeInput(input),
      result: this.sanitizeResult(result),
    });
  }

  protected async logError(error: any, input: TInput): Promise<void> {
    await this.logger.error(`Error en ${this.config.action}`, {
      error: error instanceof Error ? error.message : 'Error desconocido',
      input: this.sanitizeInput(input),
      action: this.config.action,
    });
  }

  protected sanitizeInput(input: TInput): any {
    return input;
  }

  protected sanitizeResult(result: TOutput): any {
    return result;
  }
}

export abstract class BaseGetByIdUseCase<TOutput> extends BaseUseCase<
  number,
  TOutput
> {
  constructor(logger: LoggerWrapperInterface, config: BaseUseCaseConfig) {
    super(logger, config);
  }

  protected async executeInternal(id: number): Promise<TOutput> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error(`${this.config.entityName} con ID ${id} no encontrado`);
    }
    this.validateEntity(entity);
    return this.mapToDTO(entity);
  }

  protected abstract findById(id: number): Promise<any>;
  protected abstract validateEntity(entity: any): void;
  protected abstract mapToDTO(entity: any): TOutput;
}

export abstract class BaseListUseCase<TOutput> extends BaseUseCase<
  { page?: number; limit?: number },
  TOutput
> {
  constructor(logger: LoggerWrapperInterface, config: BaseUseCaseConfig) {
    super(logger, config);
  }

  protected async executeInternal({
    page = 1,
    limit = 10,
  }: {
    page?: number;
    limit?: number;
  }): Promise<TOutput> {
    const result = await this.findAll();
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Error al obtener la lista');
    }

    const { items, total, totalPages } = result.data;
    const validEntities = items.filter((entity: unknown) => this.isValidEntity(entity));

    if (validEntities.length !== items.length) {
      throw new Error(
        `Persistencia inconsistente: uno o más ${this.config.entityName}s no tienen campos obligatorios`
      );
    }

    const dtos = validEntities.map((entity: unknown) => this.mapToDTO(entity));

    return this.createListResponse(dtos, total, page, limit, totalPages);
  }

  protected abstract findAll(): Promise<any>;
  protected abstract isValidEntity(entity: unknown): boolean;
  protected abstract mapToDTO(entity: unknown): any;
  protected abstract createListResponse(
    dtos: any[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  ): TOutput;
}

export abstract class BaseCreateUseCase<TInput, TOutput> extends BaseUseCase<
  TInput,
  TOutput
> {
  constructor(logger: LoggerWrapperInterface, config: BaseUseCaseConfig) {
    super(logger, config);
  }

  protected async executeInternal(input: TInput): Promise<TOutput> {
    const validatedData = await this.validateInput(input);
    const entity = await this.createEntity(validatedData);
    this.validateCreatedEntity(entity);
    return this.mapToDTO(entity);
  }

  protected abstract validateInput(input: TInput): Promise<any>;
  protected abstract createEntity(data: any): Promise<any>;
  protected abstract validateCreatedEntity(entity: any): void;
  protected abstract mapToDTO(entity: any): TOutput;
}

export abstract class BaseUpdateUseCase<TInput, TOutput> extends BaseUseCase<
  { id: number; data: TInput },
  TOutput
> {
  constructor(logger: LoggerWrapperInterface, config: BaseUseCaseConfig) {
    super(logger, config);
  }

  protected async executeInternal({
    id,
    data,
  }: {
    id: number;
    data: TInput;
  }): Promise<TOutput> {
    const existingEntity = await this.findById(id);
    if (!existingEntity) {
      throw new Error(`${this.config.entityName} con ID ${id} no encontrado`);
    }

    const validatedData = this.validateInput(data);
    const updatedEntity = await this.updateEntity(id, validatedData);
    this.validateUpdatedEntity(updatedEntity);
    return this.mapToDTO(updatedEntity);
  }

  protected abstract findById(id: number): Promise<any>;
  protected abstract validateInput(input: TInput): any;
  protected abstract updateEntity(id: number, data: any): Promise<any>;
  protected abstract validateUpdatedEntity(entity: any): void;
  protected abstract mapToDTO(entity: any): TOutput;
}

export abstract class BaseDeleteUseCase extends BaseUseCase<number, void> {
  constructor(logger: LoggerWrapperInterface, config: BaseUseCaseConfig) {
    super(logger, config);
  }

  protected async executeInternal(id: number): Promise<void> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error(`${this.config.entityName} con ID ${id} no encontrado`);
    }
    await this.deleteEntity(id);
  }

  protected abstract findById(id: number): Promise<any>;
  protected abstract deleteEntity(id: number): Promise<void>;
}
