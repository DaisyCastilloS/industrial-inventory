import { AuditLogResponseDTO } from './AuditLogResponseDTO';

/**
 * DTO de respuesta paginada para logs de auditoría
 * @author Daisy Castillo
 */
export interface ListAuditLogsResponseDTO {
  logs: AuditLogResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
