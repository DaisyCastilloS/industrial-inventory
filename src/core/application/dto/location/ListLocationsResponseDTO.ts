import { LocationResponseDTO } from './LocationResponseDTO';

export interface ListLocationsResponseDTO {
  locations: LocationResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
