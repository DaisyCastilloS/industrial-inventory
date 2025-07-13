/**
 * @fileoverview Interfaz para el payload personalizado de JWT
 * @author Industrial Inventory System
 * @version 1.0.0
 */

import { UserRole } from '../../00-constants/RoleTypes';
import { TokenPurpose } from '../../00-constants/TokenPurpose';

/**
 * Payload personalizado para tokens JWT
 */
export interface CustomJWTPayload {
    userId: number;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
