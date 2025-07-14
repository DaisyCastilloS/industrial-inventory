import { z } from 'zod';

export const UpdateLocationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(255).optional(),
  zone: z.string().max(50).optional(),
  shelf: z.string().max(50).optional(),
  isActive: z.boolean().optional()
});

export type UpdateLocationDTO = z.infer<typeof UpdateLocationSchema>;

export function validateUpdateLocation(data: unknown): UpdateLocationDTO {
  try {
    return UpdateLocationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((issue: any) => issue.message).join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw error;
  }
} 