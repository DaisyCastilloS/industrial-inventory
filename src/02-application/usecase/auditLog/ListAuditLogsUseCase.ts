import { IAuditLogRepository } from '../../../01-domain/repository/AuditLogRepository';
import { ListAuditLogsResponseDTO } from '../../dto/auditLog/ListAuditLogsResponseDTO';
import { AuditLogResponseDTO } from '../../dto/auditLog/AuditLogResponseDTO';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

/**
 * Caso de uso para listar logs de auditoría
 * @author Daisy Castillo
 */
export class ListAuditLogsUseCase {
  constructor(
    private auditLogRepository: IAuditLogRepository,
    private logger: LoggerWrapperInterface
  ) {}

  async execute(page: number = 1, limit: number = 10): Promise<ListAuditLogsResponseDTO> {
    const all = await this.auditLogRepository.findAll();
    const total = all.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = all.slice(start, end);
    const dtos: AuditLogResponseDTO[] = paginated.map(log => ({
      id: log.id!,
      tableName: log.tableName,
      recordId: log.recordId,
      action: String(log.action),
      oldValues: log.oldValues ?? null,
      newValues: log.newValues ?? null,
      userId: log.userId ?? null,
      ipAddress: log.ipAddress ?? null,
      userAgent: log.userAgent ?? null,
      metadata: log.metadata ?? null,
      createdAt: log.createdAt!,
      reviewed: log.reviewed
    }));
    await this.logger.info('Logs de auditoría listados', { count: dtos.length });
    return { logs: dtos, total, page, limit, totalPages };
  }
} 