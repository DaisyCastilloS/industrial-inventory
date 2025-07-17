import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';
import { CreateLocationUseCase } from '../../core/application/usecase/location/CreateLocationUseCase';
import { GetLocationByIdUseCase } from '../../core/application/usecase/location/GetLocationByIdUseCase';
import { ListLocationsUseCase } from '../../core/application/usecase/location/ListLocationsUseCase';
import { UpdateLocationUseCase } from '../../core/application/usecase/location/UpdateLocationUseCase';
import { DeleteLocationUseCase } from '../../core/application/usecase/location/DeleteLocationUseCase';
import { LocationRepositoryImpl } from '../../infrastructure/services/LocationRepositoryImpl';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';
import { validateCreateLocation } from '../../core/application/dto/location/CreateLocationDTO';
import { validateUpdateLocation } from '../../core/application/dto/location/UpdateLocationDTO';

export class LocationController extends BaseController {
  private readonly createLocationUseCase: CreateLocationUseCase;
  private readonly getLocationByIdUseCase: GetLocationByIdUseCase;
  private readonly listLocationsUseCase: ListLocationsUseCase;
  private readonly updateLocationUseCase: UpdateLocationUseCase;
  private readonly deleteLocationUseCase: DeleteLocationUseCase;

  constructor() {
    super({
      entityName: 'Location',
      successMessages: {
        created: 'Ubicación creada exitosamente',
        found: 'Ubicación encontrada',
        listed: 'Lista de ubicaciones',
        updated: 'Ubicación actualizada',
        deleted: 'Ubicación eliminada',
      },
    });

    const locationRepository = new LocationRepositoryImpl();
    const logger = new WinstonLogger();

    this.createLocationUseCase = new CreateLocationUseCase(
      locationRepository,
      logger
    );
    this.getLocationByIdUseCase = new GetLocationByIdUseCase(
      locationRepository,
      logger
    );
    this.listLocationsUseCase = new ListLocationsUseCase(
      locationRepository,
      logger
    );
    this.updateLocationUseCase = new UpdateLocationUseCase(
      locationRepository,
      logger
    );
    this.deleteLocationUseCase = new DeleteLocationUseCase(
      locationRepository,
      logger
    );
  }

  createLocation = async (req: Request, res: Response): Promise<void> => {
    await this.handleCreate(req, res, validateCreateLocation, data =>
      this.createLocationUseCase.execute(data)
    );
  };

  getLocationById = async (req: Request, res: Response): Promise<void> => {
    await this.handleGetById(req, res, id =>
      this.getLocationByIdUseCase.execute(id)
    );
  };

  listLocations = async (req: Request, res: Response): Promise<void> => {
    await this.handleList(req, res, params =>
      this.listLocationsUseCase.execute({
        page: params.page,
        limit: params.limit,
      })
    );
  };

  updateLocation = async (req: Request, res: Response): Promise<void> => {
    await this.handleUpdate(req, res, validateUpdateLocation, (id, data) =>
      this.updateLocationUseCase.execute({ id, data })
    );
  };

  deleteLocation = async (req: Request, res: Response): Promise<void> => {
    await this.handleDelete(req, res, id =>
      this.deleteLocationUseCase.execute(id)
    );
  };
}
