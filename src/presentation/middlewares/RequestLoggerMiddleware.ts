import { Request, Response, NextFunction } from 'express';
import { LoggerWrapperInterface } from '../../core/application/interface/LoggerWrapperInterface';

export function createRequestLoggerMiddleware(logger: LoggerWrapperInterface) {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.info(`➡️ ${req.method} ${req.url}`);
    next();
  };
}
