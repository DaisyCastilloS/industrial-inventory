/**
 * DTO de respuesta para logs de auditoría
 * @author Daisy Castillo
 */
export interface AuditLogResponseDTO {
  id: number;
  tableName: string;
  recordId: number;
  action: string;
  oldValues: unknown | null;
  newValues: unknown | null;
  userId: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  reviewed: boolean;
}
