import { Request, Response, NextFunction } from "express";
import { LoggerWrapperInterface } from "../../02-application/interface/LoggerWrapperInterface";

export function createErrorHandlerMiddleware(logger: LoggerWrapperInterface) {
    return (err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.error(`❌ Error in ${req.method} ${req.url}: ${err.message}`, { stack: err.stack });

        res.status(500).json({ error: "Internal server error" });
    };
}