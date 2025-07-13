/**
 * @fileoverview DTO de respuesta para usuarios
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { z } from 'zod';
import { UserRole } from '../../../00-constants/RoleTypes';

/**
 * Schema de respuesta para usuarios
 */
export const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

/**
 * Schema de respuesta para lista de usuarios
 */
export const UserListResponseSchema = z.object({
  users: z.array(UserResponseSchema),
  total: z.number(),
  page: z.number().optional(),
  limit: z.number().optional(),
  totalPages: z.number().optional()
});

/**
 * Tipo TypeScript para respuesta de usuario
 */
export type UserResponseDTO = z.infer<typeof UserResponseSchema>;

/**
 * Tipo TypeScript para respuesta de lista de usuarios
 */
export type UserListResponseDTO = z.infer<typeof UserListResponseSchema>;

/**
 * Valida la respuesta de usuario
 * @param data - Datos a validar
 * @returns Datos validados
 * @throws {Error} Si los datos son inválidos
 */
export function validateUserResponse(data: unknown): UserResponseDTO {
  return UserResponseSchema.parse(data);
}

/**
 * Valida la respuesta de lista de usuarios
 * @param data - Datos a validar
 * @returns Datos validados
 * @throws {Error} Si los datos son inválidos
 */
export function validateUserListResponse(data: unknown): UserListResponseDTO {
  return UserListResponseSchema.parse(data);
} 