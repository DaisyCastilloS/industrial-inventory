import { z } from 'zod';

export const LoginUserSchema = z.object({
  email: z
    .string()
    .email('Email debe tener un formato válido')
    .min(1, 'Email es requerido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});

export type LoginUserDTO = z.infer<typeof LoginUserSchema>;

export function validateLoginUserDTO(data: unknown): LoginUserDTO {
  try {
    return LoginUserSchema.parse(data);
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
