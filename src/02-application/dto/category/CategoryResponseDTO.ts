export interface CategoryResponseDTO {
  id: number;
  name: string;
  description?: string | null;
  parentId?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 