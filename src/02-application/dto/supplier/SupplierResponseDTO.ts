export interface SupplierResponseDTO {
  id: number;
  name: string;
  description?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 