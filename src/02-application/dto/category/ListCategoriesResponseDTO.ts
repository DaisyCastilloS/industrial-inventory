import { CategoryResponseDTO } from './CategoryResponseDTO';

export interface ListCategoriesResponseDTO {
  categories: CategoryResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 