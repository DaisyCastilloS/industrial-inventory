import express, { Express } from "express";
import { ServerWrapperInterface } from "../../02-application/interface/ServerWrapperInterface";
import { WinstonLogger } from "../../03-infrastructure/logger/WinstonLogger";

export class ExpressServer implements ServerWrapperInterface {
    private readonly app: Express;
    private readonly port: number;
    private readonly logger: WinstonLogger;

    constructor(port: number = 3000) {
        this.app = express();
        this.port = port;
        this.logger = new WinstonLogger();
    }

    start(): void {
        this.app.listen(this.port, () => {
            this.logger.info(`✅ Server running on http://localhost:${this.port}`);
            this.logger.info(`📚 Swagger docs available at http://localhost:${this.port}/docs`);
        });
    }

    registerRoute(method: "get" | "post" | "put" | "delete", path: string, handler: (...args: any[]) => void): void {
        this.app[method](path, handler);
    }

    useMiddleware(...args: any[]): void {
        this.app.use(...args);
    }

    setErrorHandler(errorHandler: (...args: any[]) => void): void {
        this.app.use(errorHandler);
    }

    getApp(): Express {
        return this.app;
    }
}