import { z } from 'zod';

export const CreateSupplierSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z
    .string()
    .max(255, 'La descripción no puede exceder 255 caracteres')
    .optional(),
  contactPerson: z
    .string()
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres')
    .optional(),
  email: z.string().email('Email de contacto inválido').max(100).optional(),
  phone: z
    .string()
    .max(30, 'El teléfono no puede exceder 30 caracteres')
    .optional(),
  address: z
    .string()
    .max(255, 'La dirección no puede exceder 255 caracteres')
    .optional(),
  isActive: z.boolean().optional().default(true),
});

export type CreateSupplierDTO = z.infer<typeof CreateSupplierSchema>;

export function validateCreateSupplier(data: unknown): CreateSupplierDTO {
  try {
    return CreateSupplierSchema.parse(data);
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
