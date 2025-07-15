/**
 * @fileoverview Controlador para logs de auditoría
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';
import { ListAuditLogsUseCase } from '../../core/application/usecase/auditLog/ListAuditLogsUseCase';
import { AuditLogRepositoryImpl } from '../../infrastructure/services/AuditLogRepositoryImpl';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';

/**
 * Controlador para logs de auditoría
 */
export class AuditLogController extends BaseController {
  private readonly listAuditLogsUseCase: ListAuditLogsUseCase;

  constructor() {
    super({
      entityName: 'AuditLog',
      successMessages: {
        created: 'Log de auditoría creado exitosamente',
        found: 'Log de auditoría encontrado',
        listed: 'Lista de logs de auditoría',
        updated: 'Log de auditoría actualizado',
        deleted: 'Log de auditoría eliminado',
      },
    });

    const auditLogRepository = new AuditLogRepositoryImpl();
    const logger = new WinstonLogger();

    this.listAuditLogsUseCase = new ListAuditLogsUseCase(
      auditLogRepository,
      logger
    );
  }

  listAuditLogs = async (req: Request, res: Response): Promise<void> => {
    await this.handleList(req, res, params =>
      this.listAuditLogsUseCase.execute({
        page: params.page,
        limit: params.limit,
      })
    );
  };
}
