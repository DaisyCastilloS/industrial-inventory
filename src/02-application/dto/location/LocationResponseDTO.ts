export interface LocationResponseDTO {
  id: number;
  name: string;
  description?: string | null;
  code: string;
  type: string;
  parentId?: number | null;
  zone?: string | null;
  shelf?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 