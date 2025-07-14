import { SupplierResponseDTO } from './SupplierResponseDTO';

export interface ListSuppliersResponseDTO {
  suppliers: SupplierResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 