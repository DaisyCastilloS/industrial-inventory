/**
 * @fileoverview Caso de uso para listar logs de auditoría
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { BaseListUseCase } from '../base/BaseUseCase';
import { IAuditLogRepository } from '../../../domain/repository/AuditLogRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';
import { ListAuditLogsResponseDTO } from '../../dto/auditLog/ListAuditLogsResponseDTO';
import { AuditLogResponseDTO } from '../../dto/auditLog/AuditLogResponseDTO';
import { DTOMapper } from '../../utils/DTOMapper';

/**
 * Caso de uso para listar logs de auditoría
 */
export class ListAuditLogsUseCase extends BaseListUseCase<ListAuditLogsResponseDTO> {
  constructor(
    private auditLogRepository: IAuditLogRepository,
    logger: LoggerWrapperInterface
  ) {
    super(logger, {
      action: 'LIST_AUDIT_LOGS',
      entityName: 'AuditLog',
    });
  }

  protected async findAll(): Promise<any[]> {
    return this.auditLogRepository.findAll();
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
