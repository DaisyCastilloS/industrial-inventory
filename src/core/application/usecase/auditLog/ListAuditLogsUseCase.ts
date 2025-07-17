import { BaseListUseCase } from '../base/BaseUseCase';
import { AuditLogRepositoryImpl } from '../../../../infrastructure/services/AuditLogRepositoryImpl';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ListAuditLogsResponseDTO } from '../../dto/auditLog/ListAuditLogsResponseDTO';
import { AuditLogResponseDTO } from '../../dto/auditLog/AuditLogResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

export class ListAuditLogsUseCase extends BaseListUseCase<ListAuditLogsResponseDTO> {
  constructor(
    private auditLogRepository: AuditLogRepositoryImpl,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'LIST_AUDIT_LOGS',
      entityName: 'AuditLog',
    });
  }

  protected async findAll({ page = 1, limit = 10 } = {}): Promise<any> {
    // Simulate pagination for audit logs
    const result = await this.auditLogRepository.findAll();
    const allLogs = result.data || [];
    const total = allLogs.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedLogs = allLogs.slice(start, end);
    return {
      success: true,
      data: {
        items: paginatedLogs,
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  protected isValidEntity(entity: any): boolean {
    return !!(entity.id && entity.createdAt);
  }

  protected mapToDTO(entity: any): AuditLogResponseDTO {
    return {
      id: entity.id!,
      tableName: entity.tableName,
      recordId: entity.recordId,
      action: String(entity.action),
      oldValues: entity.oldValues ?? null,
      newValues: entity.newValues ?? null,
      userId: entity.userId ?? null,
      ipAddress: entity.ipAddress ?? null,
      userAgent: entity.userAgent ?? null,
      metadata: entity.metadata ?? null,
      createdAt: entity.createdAt!,
      reviewed: entity.reviewed,
    };
  }

  protected createListResponse(
    dtos: AuditLogResponseDTO[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  ): ListAuditLogsResponseDTO {
    return {
      logs: dtos,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
