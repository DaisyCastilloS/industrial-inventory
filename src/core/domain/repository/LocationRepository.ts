import { Location, ILocation } from '../entity/Location';
import type { LocationName } from '../entity/Location';

export interface ILocationRepository {
  create(location: ILocation): Promise<Location>;
  findById(id: number): Promise<Location | null>;
  findByName(name: LocationName | string): Promise<Location | null>;
  findAll(): Promise<Location[]>;
  findActive(): Promise<Location[]>;
  findByDescription(description: string): Promise<Location[]>;
  update(id: number, locationData: Partial<ILocation>): Promise<Location>;
  delete(id: number): Promise<void>;
  activate(id: number): Promise<Location>;
}
