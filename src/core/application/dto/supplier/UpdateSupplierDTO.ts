import { z } from 'zod';

export const UpdateSupplierSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(255).optional(),
  contactName: z.string().max(100).optional(),
  contactEmail: z.string().email().max(100).optional(),
  contactPhone: z.string().max(30).optional(),
  address: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateSupplierDTO = z.infer<typeof UpdateSupplierSchema>;

export function validateUpdateSupplier(data: unknown): UpdateSupplierDTO {
  try {
    return UpdateSupplierSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((issue: any) => issue.message)
        .join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw error;
  }
}
