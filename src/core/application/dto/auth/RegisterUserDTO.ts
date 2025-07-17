import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z
    .string()
    .email('Email debe tener un formato válido')
    .min(1, 'Email es requerido')
    .max(100, 'Email debe tener menos de 100 caracteres'),
  password: z
    .string()
    .min(6, 'Contraseña debe tener al menos 6 caracteres')
    .max(50, 'Contraseña debe tener menos de 50 caracteres'),
  name: z
    .string()
    .min(1, 'Nombre es requerido')
    .max(100, 'Nombre debe tener menos de 100 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'Nombre solo puede contener letras y espacios'
    ),
  role: z.enum(['ADMIN', 'USER', 'VIEWER', 'MANAGER', 'SUPERVISOR', 'AUDITOR']).default('USER'),
});

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;

export function validateRegisterUserDTO(data: unknown): RegisterUserDTO {
  console.log('DEBUG: validateRegisterUserDTO input:', JSON.stringify(data, null, 2));
  console.log('DEBUG: password type:', typeof (data as any)?.password);
  console.log('DEBUG: password value:', (data as any)?.password);
  
  try {
    const result = RegisterUserSchema.parse(data);
    console.log('DEBUG: validation successful:', result);
    return result;
  } catch (error) {
    console.log('DEBUG: validation error:', error);
    if (error instanceof z.ZodError) {
      console.log('DEBUG: zod errors:', error.errors);
    }
    throw error;
  }
}
