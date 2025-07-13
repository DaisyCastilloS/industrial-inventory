import express, { Express, RequestHandler, Request, Response, NextFunction } from "express";
import { ServerWrapperInterface, ServerConfig, CustomMiddleware } from "../../02-application/interface/ServerWrapperInterface";
import { WinstonLogger } from "../../03-infrastructure/logger/WinstonLogger";

export class ExpressServer implements ServerWrapperInterface {
    private readonly app: Express;
    private readonly port: number;
    private readonly logger: WinstonLogger;
    private server: any;
    private isRunningFlag: boolean = false;

    constructor(port: number = 3000) {
        this.app = express();
        this.port = port;
        this.logger = new WinstonLogger();
    }

    async start(config: ServerConfig): Promise<void> {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.port, () => {
                this.isRunningFlag = true;
                this.logger.info(`✅ Server running on http://localhost:${this.port}`);
                this.logger.info(`📚 Swagger docs available at http://localhost:${this.port}/docs`);
                resolve();
            });
        });
    }

    async stop(): Promise<void> {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    this.isRunningFlag = false;
                    this.logger.info('Server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    use(middleware: CustomMiddleware): void {
        this.app.use(middleware);
    }

    usePath(path: string, middleware: CustomMiddleware): void {
        this.app.use(path, middleware);
    }

    get(path: string, handler: (req: Request, res: Response) => void | Promise<void>): void {
        this.app.get(path, handler);
    }

    post(path: string, handler: (req: Request, res: Response) => void | Promise<void>): void {
        this.app.post(path, handler);
    }

    put(path: string, handler: (req: Request, res: Response) => void | Promise<void>): void {
        this.app.put(path, handler);
    }

    delete(path: string, handler: (req: Request, res: Response) => void | Promise<void>): void {
        this.app.delete(path, handler);
    }

    patch(path: string, handler: (req: Request, res: Response) => void | Promise<void>): void {
        this.app.patch(path, handler);
    }

    useRouter(path: string, router: any): void {
        this.app.use(path, router);
    }

    setErrorHandler(errorHandler: (error: Error, req: Request, res: Response, next: NextFunction) => void): void {
        this.app.use(errorHandler);
    }

    setNotFoundHandler(handler: (req: Request, res: Response) => void): void {
        this.app.use('*', handler);
    }

    async getStats(): Promise<{
        uptime: number;
        requests: number;
        errors: number;
        activeConnections: number;
    }> {
        return {
            uptime: process.uptime(),
            requests: 0, // Implementar contador de requests
            errors: 0,   // Implementar contador de errores
            activeConnections: 0 // Implementar contador de conexiones
        };
    }

    isRunning(): boolean {
        return this.isRunningFlag;
    }

    getUrl(): string {
        return `http://localhost:${this.port}`;
    }

    // Métodos de conveniencia para compatibilidad
    registerRoute(method: "get" | "post" | "put" | "delete", path: string, ...handlers: RequestHandler[]): void {
        this.app[method](path, ...handlers);
    }

    useMiddleware(...args: any[]): void {
        this.app.use(...args);
    }

    getApp(): Express {
        return this.app;
    }
}