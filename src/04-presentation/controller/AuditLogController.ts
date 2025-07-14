import { Request, Response } from 'express';
import { ListAuditLogsUseCase } from '../../02-application/usecase/auditLog/ListAuditLogsUseCase';
import { AuditLogRepositoryImpl } from '../../03-infrastructure/services/AuditLogRepositoryImpl';
import { WinstonLogger } from '../../03-infrastructure/logger/WinstonLogger';
import { buildSuccessResponse, buildErrorResponse } from '../utils/ResponseHelper';

export class AuditLogController {
  private readonly listAuditLogsUseCase: ListAuditLogsUseCase;

  constructor() {
    const auditLogRepository = new AuditLogRepositoryImpl();
    const logger = new WinstonLogger();
    this.listAuditLogsUseCase = new ListAuditLogsUseCase(auditLogRepository, logger);
  }

  listAuditLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const logs = await this.listAuditLogsUseCase.execute();
      res.status(200).json(buildSuccessResponse('Lista de logs de auditoría', logs));
    } catch (error) {
      this.handleError(error, req, res, 'listAuditLogs');
    }
  };

  private handleError(error: any, req: Request, res: Response, method: string): void {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    res.status(400).json(buildErrorResponse(`Error en ${method}`, message));
  }
} 