/**
 * Utility functions for building consistent API responses
 */

// Interfaces para respuestas de API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
  path?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path?: string;
}

export interface ListResponse<T> extends ApiResponse<T[]> {
  metadata: {
    count: number;
    total: number;
    page?: number;
    limit?: number;
  };
}

/**
 * Construye una respuesta de éxito genérica
 */
export function buildSuccessResponse<T>(
  message: string,
  data?: T,
  path?: string
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    path
  };
}

/**
 * Construye una respuesta de error
 */
export function buildErrorResponse(
  type: string,
  message: string,
  details?: any,
  path?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      type,
      message,
      details
    },
    timestamp: new Date().toISOString(),
    path
  };
}

/**
 * Construye una respuesta de creación exitosa
 */
export function buildCreatedResponse<T>(
  data: T,
  message: string = 'Resource created successfully',
  path?: string
): ApiResponse<T> {
  return buildSuccessResponse(message, data, path);
}

/**
 * Construye una respuesta de actualización exitosa
 */
export function buildUpdatedResponse(
  id: number | string,
  message: string = 'Resource updated successfully',
  path?: string
): ApiResponse<{ id: number | string }> {
  return buildSuccessResponse(message, { id }, path);
}

/**
 * Construye una respuesta de eliminación exitosa
 */
export function buildDeletedResponse(
  id: number | string,
  message: string = 'Resource deleted successfully',
  path?: string
): ApiResponse<{ id: number | string }> {
  return buildSuccessResponse(message, { id }, path);
}

/**
 * Construye una respuesta de lista con metadata
 */
export function buildListResponse<T>(
  data: T[],
  message: string = 'Resources retrieved successfully',
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
  },
  path?: string
): ListResponse<T> {
  return {
    success: true,
    message,
    data,
    metadata: {
      count: data.length,
      total: metadata?.total || data.length,
      page: metadata?.page,
      limit: metadata?.limit
    },
    timestamp: new Date().toISOString(),
    path
  };
} 