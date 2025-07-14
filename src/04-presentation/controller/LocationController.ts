import { Request, Response } from 'express';
import { CreateLocationUseCase } from '../../02-application/usecase/location/CreateLocationUseCase';
import { GetLocationByIdUseCase } from '../../02-application/usecase/location/GetLocationByIdUseCase';
import { ListLocationsUseCase } from '../../02-application/usecase/location/ListLocationsUseCase';
import { UpdateLocationUseCase } from '../../02-application/usecase/location/UpdateLocationUseCase';
import { DeleteLocationUseCase } from '../../02-application/usecase/location/DeleteLocationUseCase';
import { LocationRepositoryImpl } from '../../03-infrastructure/services/LocationRepositoryImpl';
import { WinstonLogger } from '../../03-infrastructure/logger/WinstonLogger';
import { validateCreateLocation } from '../../02-application/dto/location/CreateLocationDTO';
import { validateUpdateLocation } from '../../02-application/dto/location/UpdateLocationDTO';
import { buildSuccessResponse, buildCreatedResponse, buildErrorResponse } from '../utils/ResponseHelper';

export class LocationController {
  private readonly createLocationUseCase: CreateLocationUseCase;
  private readonly getLocationByIdUseCase: GetLocationByIdUseCase;
  private readonly listLocationsUseCase: ListLocationsUseCase;
  private readonly updateLocationUseCase: UpdateLocationUseCase;
  private readonly deleteLocationUseCase: DeleteLocationUseCase;

  constructor() {
    const locationRepository = new LocationRepositoryImpl();
    const logger = new WinstonLogger();
    this.createLocationUseCase = new CreateLocationUseCase(locationRepository, logger);
    this.getLocationByIdUseCase = new GetLocationByIdUseCase(locationRepository, logger);
    this.listLocationsUseCase = new ListLocationsUseCase(locationRepository, logger);
    this.updateLocationUseCase = new UpdateLocationUseCase(locationRepository, logger);
    this.deleteLocationUseCase = new DeleteLocationUseCase(locationRepository, logger);
  }

  createLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = validateCreateLocation(req.body);
      const location = await this.createLocationUseCase.execute(validatedData);
      res.status(201).json(buildCreatedResponse(location, 'Ubicación creada exitosamente'));
    } catch (error) {
      this.handleError(error, req, res, 'createLocation');
    }
  };

  getLocationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const location = await this.getLocationByIdUseCase.execute(id);
      res.status(200).json(buildSuccessResponse('Ubicación encontrada', location));
    } catch (error) {
      this.handleError(error, req, res, 'getLocationById');
    }
  };

  listLocations = async (req: Request, res: Response): Promise<void> => {
    try {
      const locations = await this.listLocationsUseCase.execute();
      res.status(200).json(buildSuccessResponse('Lista de ubicaciones', locations));
    } catch (error) {
      this.handleError(error, req, res, 'listLocations');
    }
  };

  updateLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const validatedData = validateUpdateLocation(req.body);
      const location = await this.updateLocationUseCase.execute(id, validatedData);
      res.status(200).json(buildSuccessResponse('Ubicación actualizada', location));
    } catch (error) {
      this.handleError(error, req, res, 'updateLocation');
    }
  };

  deleteLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.deleteLocationUseCase.execute(id);
      res.status(200).json(buildSuccessResponse('Ubicación eliminada', { id }));
    } catch (error) {
      this.handleError(error, req, res, 'deleteLocation');
    }
  };

  private handleError(error: any, req: Request, res: Response, method: string): void {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(400).json(buildErrorResponse(`Error en ${method}`, message));
  }
} 