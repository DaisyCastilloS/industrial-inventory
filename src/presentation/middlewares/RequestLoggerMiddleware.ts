import { Request, Response, NextFunction } from 'express';
import { LoggerWrapperInterface } from '../../core/application/interface/LoggerWrapperInterface';

export function createRequestLoggerMiddleware(logger: LoggerWrapperInterface) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

      logger[logLevel](`${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        body: req.body,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('user-agent'),
        ip: req.ip,
      });
    });

    next();
  };
}
