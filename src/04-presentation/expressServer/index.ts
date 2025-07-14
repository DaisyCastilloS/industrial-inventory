import express from "express";
import router from './routes';
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { createErrorHandlerMiddleware } from "../middlewares/ErrorHandlerMiddleware";
import { createRequestLoggerMiddleware } from "../middlewares/RequestLoggerMiddleware";
import { WinstonLogger } from "../../03-infrastructure/logger/WinstonLogger";

const port = Number(process.env.PORT) || 3000;
const loggerInstance = new WinstonLogger();

// Obtener __dirname equivalente en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requests
app.use(createRequestLoggerMiddleware(loggerInstance));

// Documentación Swagger
const swaggerDocument = YAML.load(path.resolve(__dirname, "../../03-infrastructure/docs/swagger.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rutas RESTful principales
app.use('/', router);

// Manejo de errores
app.use(createErrorHandlerMiddleware(loggerInstance));

// Iniciar servidor
app.listen(port, () => {
  loggerInstance.info("=".repeat(50));
  loggerInstance.info(`🚀 Servidor API corriendo en: http://localhost:${port}`);
  loggerInstance.info(`📚 Documentación disponible en: http://localhost:${port}/docs`);
  loggerInstance.info("=".repeat(50));
});