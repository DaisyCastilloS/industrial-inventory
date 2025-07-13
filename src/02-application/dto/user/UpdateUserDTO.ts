/**
 * @fileoverview DTO para actualizar usuarios
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { z } from 'zod';
import { UserRole } from '../../../00-constants/RoleTypes';

/**
 * Schema de validación para actualizar usuarios
 */
export const UpdateUserSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email es requerido')
    .max(100, 'Email no puede exceder 100 caracteres')
    .optional(),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(255, 'La contraseña no puede exceder 255 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una minúscula, una mayúscula y un número')
    .optional(),
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .optional(),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Rol de usuario inválido' })
  }).optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Al menos un campo debe ser proporcionado para actualizar',
  path: ['general']
});

/**
 * Tipo TypeScript para actualizar usuarios
 */
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;

/**
 * Valida los datos para actualizar un usuario
 * @param data - Datos a validar
 * @returns Datos validados
 * @throws {Error} Si los datos son inválidos
 */
export function validateUpdateUser(data: unknown): UpdateUserDTO {
  return UpdateUserSchema.parse(data);
}

/**
 * Valida los datos para actualizar un usuario de forma segura
 * @param data - Datos a validar
 * @returns Resultado de la validación
 */
export function safeValidateUpdateUser(data: unknown): { success: true; data: UpdateUserDTO } | { success: false; errors: string[] } {
  const result = UpdateUserSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.errors.map(err => err.message);
    return { success: false, errors };
  }
} 