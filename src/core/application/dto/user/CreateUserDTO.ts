/**
 * @fileoverview DTO para crear usuarios
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { z } from 'zod';
import { UserRole } from '../../../../shared/constants/RoleTypes';

/**
 * Schema de validación para crear usuarios
 */
export const CreateUserSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'Email es requerido')
    .max(100, 'Email no puede exceder 100 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'El nombre solo puede contener letras y espacios'
    ),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Rol de usuario inválido' }),
  }),
  isActive: z.boolean().optional().default(true),
});

/**
 * Tipo TypeScript para crear usuarios
 */
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;

/**
 * Valida los datos para crear un usuario
 * @param data - Datos a validar
 * @returns Datos validados
 * @throws {Error} Si los datos son inválidos
 */
export function validateCreateUser(data: unknown): CreateUserDTO {
  console.log('DEBUG: validateCreateUser input:', JSON.stringify(data, null, 2));
  console.log('DEBUG: password type:', typeof (data as any)?.password);
  console.log('DEBUG: password value:', (data as any)?.password);
  console.log('DEBUG: password length:', (data as any)?.password?.length);
  
  try {
    const result = CreateUserSchema.parse(data);
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

/**
 * Valida los datos para crear un usuario de forma segura
 * @param data - Datos a validar
 * @returns Resultado de la validación
 */
export function safeValidateCreateUser(
  data: unknown
):
  | { success: true; data: CreateUserDTO }
  | { success: false; errors: string[] } {
  const result = CreateUserSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.errors.map(err => err.message);
    return { success: false, errors };
  }
}
