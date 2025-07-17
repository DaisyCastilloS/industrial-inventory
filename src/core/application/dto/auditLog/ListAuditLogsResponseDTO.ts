import { AuditLogResponseDTO } from './AuditLogResponseDTO';

export interface ListAuditLogsResponseDTO {
  logs: AuditLogResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
