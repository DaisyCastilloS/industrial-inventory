import { z } from 'zod';

// Schema de validación para registro de usuario
export const RegisterUserSchema = z.object({
  email: z.string()
    .email('Email debe tener un formato válido')
    .min(1, 'Email es requerido')
    .max(100, 'Email debe tener menos de 100 caracteres'),
  password: z.string()
    .min(6, 'Contraseña debe tener al menos 6 caracteres')
    .max(50, 'Contraseña debe tener menos de 50 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  name: z.string()
    .min(1, 'Nombre es requerido')
    .max(100, 'Nombre debe tener menos de 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Nombre solo puede contener letras y espacios'),
  role: z.enum(['ADMIN', 'USER', 'VIEWER']).default('USER')
});

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;

/**
 * Valida los datos de entrada para registro de usuario
 * @param data - Datos a validar
 * @returns Datos validados
 * @throws UserValidationError si la validación falla
 */
export function validateRegisterUserDTO(data: unknown): RegisterUserDTO {
  try {
    return RegisterUserSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((issue: any) => issue.message).join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }
    throw error;
  }
} 