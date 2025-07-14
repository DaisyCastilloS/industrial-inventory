import { z } from 'zod';

export const UpdateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(255).optional(),
  parentId: z.number().int().positive().optional(),
  isActive: z.boolean().optional()
});

export type UpdateCategoryDTO = z.infer<typeof UpdateCategorySchema>;

export function validateUpdateCategory(data: unknown): UpdateCategoryDTO {
  try {
    return UpdateCategorySchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((issue: any) => issue.message).join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw error;
  }
} 