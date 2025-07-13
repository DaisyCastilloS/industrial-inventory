import { ExpressServer } from "../../04-presentation/expressServer/ExpressServer";
import { ProductController } from "../controller/ProductController";
import { ProductRepositoryImpl } from "../../03-infrastructure/services/ProductRepositoryImpl";
import { CategoryRepositoryImpl } from "../../03-infrastructure/services/CategoryRepositoryImpl";
import { LocationRepositoryImpl } from "../../03-infrastructure/services/LocationRepositoryImpl";
import { SupplierRepositoryImpl } from "../../03-infrastructure/services/SupplierRepositoryImpl";
import { ProductMovementRepositoryImpl } from "../../03-infrastructure/services/ProductMovementRepositoryImpl";
import { AuditLogRepositoryImpl } from "../../03-infrastructure/services/AuditLogRepositoryImpl";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import express from "express";
import { createErrorHandlerMiddleware } from "../middlewares/ErrorHandlerMiddleware";
import { createRequestLoggerMiddleware } from "../middlewares/RequestLoggerMiddleware";
import { createAuthMiddleware, createRoleMiddleware } from "../middlewares/AuthMiddleware";
import { WinstonLogger } from "../../03-infrastructure/logger/WinstonLogger";
import { AuthController } from "../controller/AuthController";
import { UserRepositoryImpl } from "../../03-infrastructure/services/UserRepositoryImpl";
import { AuthService } from "../../03-infrastructure/services/AuthService";
import { EncryptionService } from "../../03-infrastructure/services/EncryptionService";
import { JWTService } from "../../03-infrastructure/services/JWTService";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

const port = Number(process.env.PORT) || 3000;
const server = new ExpressServer(port);
const loggerInstance = new WinstonLogger();
const productRepository = new ProductRepositoryImpl();
const productController = new ProductController(productRepository, loggerInstance);
const userRepository = new UserRepositoryImpl();
const encryptionService = new EncryptionService();
const jwtService = new JWTService();
const authService = new AuthService(userRepository, encryptionService, jwtService, loggerInstance);
const authController = new AuthController(userRepository, loggerInstance);

// Cargar Swagger
const swaggerDocument = YAML.load(path.resolve(__dirname, "../../03-infrastructure/docs/swagger.yaml"));

// Exponemos app si se quiere usar express para middlewares como swagger
const app = server.getApp();

// Middlewares de seguridad
app.use(helmet());
app.use(cors());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas requests desde esta IP, intenta de nuevo más tarde',
    error: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use(limiter);

// Middlewares globales
server.useMiddleware(express.json());
server.useMiddleware(express.urlencoded({ extended: true }));

// Logging de requests
server.useMiddleware(createRequestLoggerMiddleware(loggerInstance));

// Documentación Swagger
server.useMiddleware("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware de autenticación
const authMiddleware = createAuthMiddleware(loggerInstance);

// Rutas públicas (sin autenticación)
server.registerRoute("post", "/auth/register", authController.registerUser);
server.registerRoute("post", "/auth/login", authController.loginUser);

// Rutas protegidas (con autenticación)
server.registerRoute("get", "/products", authMiddleware, productController.getAllProducts);
server.registerRoute("post", "/products", authMiddleware, createRoleMiddleware(['ADMIN', 'USER']), productController.createProduct);
server.registerRoute("get", "/products/:id", authMiddleware, productController.getProductById);
server.registerRoute("put", "/products/:id", authMiddleware, createRoleMiddleware(['ADMIN', 'USER']), productController.updateProduct);
server.registerRoute("delete", "/products/:id", authMiddleware, createRoleMiddleware(['ADMIN']), productController.deleteProduct);

// Rutas de reportes (solo admin)
server.registerRoute("get", "/reports/critical-stock", authMiddleware, createRoleMiddleware(['ADMIN']), productController.getCriticalStockProducts);
server.registerRoute("get", "/reports/inventory-stats", authMiddleware, createRoleMiddleware(['ADMIN']), productController.getInventoryStats);

// Rutas de auditoría (solo admin)
server.registerRoute("get", "/audit-logs", authMiddleware, createRoleMiddleware(['ADMIN']), productController.getAuditLogs);

// Manejo de errores
server.setErrorHandler(createErrorHandlerMiddleware(loggerInstance));

// Iniciar servidor
server.start();