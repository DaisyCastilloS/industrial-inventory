export interface ServerWrapperInterface {
    start(): void;
    registerRoute(method: "get" | "post" | "put" | "delete", path: string, handler: (...args: any[]) => void): void;
    useMiddleware(middleware: (...args: any[]) => void): void;
    setErrorHandler(errorHandler: (...args: any[]) => void): void;
}