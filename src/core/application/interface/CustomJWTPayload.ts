/**
 * @fileoverview Interfaz para el payload personalizado de JWT
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { UserRole } from '../../../shared/constants/RoleTypes';
import { TokenPurpose } from '../../../shared/constants/TokenPurpose';

/**
 * Payload personalizado para tokens JWT
 */
export interface CustomJWTPayload {
  userId: number;
  email: string;
  role: string;
  purpose: TokenPurpose;
  iat?: number;
  exp?: number;
}
