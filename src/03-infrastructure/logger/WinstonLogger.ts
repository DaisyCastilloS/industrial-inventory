import { createLogger, transports, format } from "winston";
import { LoggerWrapperInterface } from "../../02-application/interface/LoggerWrapperInterface";

export class WinstonLogger implements LoggerWrapperInterface {
    private logger = createLogger({
        level: "info",
        format: format.combine(
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            format.errors({ stack: true }),
            format.splat(),
            format.printf(({ timestamp, level, message, stack }) =>
                stack
                    ? `[${timestamp}] ${level}: ${message} \n ${stack}`
                    : `[${timestamp}] ${level}: ${message}`
            )
        ),
        transports: [
            new transports.Console(),
            new transports.File({ filename: "logs/error.log", level: "error" }),
            new transports.File({ filename: "logs/combined.log" })
        ]
    });

    info(message: string, context?: Record<string, unknown>) {
        this.logger.info(message, context);
    }

    warn(message: string, context?: Record<string, unknown>) {
        this.logger.warn(message, context);
    }

    error(message: string, context?: Record<string, unknown>) {
        this.logger.error(message, context);
    }

    debug(message: string, context?: Record<string, unknown>) {
        this.logger.debug(message, context);
    }
}