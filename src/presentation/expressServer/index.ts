/**
 * @fileoverview Configuración optimizada del servidor Express
 * @author Daisy Castillo
 * @version 1.0.0
 */

import express from 'express';
import router from './routes';
import swaggerUi from 'swagger-ui-express';
import { load as loadYaml } from 'js-yaml';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createErrorHandlerMiddleware } from '../middlewares/ErrorHandlerMiddleware';
import { createRequestLoggerMiddleware } from '../middlewares/RequestLoggerMiddleware';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';

const port = Number(process.env.PORT) || 3000;
const loggerInstance = new WinstonLogger();

// Obtener __dirname equivalente en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Cargar swagger.yaml
const swaggerDocument = loadYaml(
  readFileSync(
    path.join(__dirname, '../../infrastructure/docs/swagger.yaml'),
    'utf8'
  )
) as swaggerUi.JsonObject;

// Configuración de seguridad
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  })
);

// Configuración de CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 600, // 10 minutos
  })
);

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por IP
  standardHeaders: true,
  legacyHeaders: false,
  message:
    'Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 15 minutos',
});
app.use(limiter);

// Configuración de compresión
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // nivel de compresión (1-9)
    threshold: 1024, // comprimir solo respuestas mayores a 1KB
  })
);

// Parsers y middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use(createRequestLoggerMiddleware(loggerInstance));

// Documentación Swagger
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Industrial Inventory API Docs',
    customfavIcon: '/favicon.ico',
  })
);

// Rutas de la API
app.use('/api/v1', router);

// Middleware de manejo de errores
app.use(createErrorHandlerMiddleware(loggerInstance));

// Iniciar servidor
const server = app.listen(port, () => {
  loggerInstance.info('='.repeat(50));
  loggerInstance.info(`🚀 Servidor API corriendo en: http://localhost:${port}`);
  loggerInstance.info(
    `📚 Documentación disponible en: http://localhost:${port}/docs`
  );
  loggerInstance.info('='.repeat(50));
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  loggerInstance.info('Recibida señal SIGTERM. Cerrando servidor...');
  server.close(() => {
    loggerInstance.info('Servidor cerrado exitosamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  loggerInstance.info('Recibida señal SIGINT. Cerrando servidor...');
  server.close(() => {
    loggerInstance.info('Servidor cerrado exitosamente');
    process.exit(0);
  });
});

export default app;
