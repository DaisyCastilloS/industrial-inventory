/**
 * @fileoverview Tipos compartidos para servicios
 * @author Daisy Castillo
 */

import { BaseEntity } from '../../../domain/repository/base/BaseRepository';

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export interface DatabaseError extends Error {
  code: string;
  detail?: string;
  table?: string;
  constraint?: string;
}

export interface RepositoryOptions {
  withDeleted?: boolean;
  withRelations?: boolean;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CacheConfig {
  ttl: number; // tiempo de vida en segundos
  maxSize: number; // tamaño máximo de caché
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  message?: string;
}

export interface AuditOptions {
  userId?: number;
  action: string;
  details?: Record<string, any>;
}

export interface CacheOptions {
  bypass?: boolean;
  ttl?: number;
}
