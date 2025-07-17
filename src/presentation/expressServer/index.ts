import 'dotenv/config';
import express, { Application } from 'express';
import router from './routes';
import swaggerUi from 'swagger-ui-express';
import { load as loadYaml } from 'js-yaml';
import { readFileSync } from 'fs';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createErrorHandlerMiddleware } from '../middlewares/ErrorHandlerMiddleware';
import { createRequestLoggerMiddleware } from '../middlewares/RequestLoggerMiddleware';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';

const port = Number(process.env.PORT) || 3000;
const loggerInstance = new WinstonLogger();

const app: Application = express();

const swaggerDocument = loadYaml(
  readFileSync(
    path.join(__dirname, '../../../src/infrastructure/docs/swagger.yaml'),
    'utf8'
  )
) as swaggerUi.JsonObject;

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

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 600,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Aumentado de 100 a 1000 para pruebas
  standardHeaders: true,
  legacyHeaders: false,
  message:
    'Too many requests from this IP, please try again in 15 minutes',
});
app.use(limiter);

app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024,
  })
);

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  console.log('DEBUG: Express middleware - req.body:', JSON.stringify(req.body, null, 2));
  console.log('DEBUG: Express middleware - req.headers:', JSON.stringify(req.headers, null, 2));
  next();
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(createRequestLoggerMiddleware(loggerInstance));

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Industrial Inventory API Docs',
    customfavIcon: '/favicon.ico',
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    success: true,
    message: 'Sistema funcionando correctamente',
    timestamp: new Date().toISOString(),
    data: {
      status: 'healthy',
      uptime: Math.floor(uptime),
      database: 'connected',
      version: '1.0.0',
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      }
    }
  });
});

app.use('/api', router);

app.use(createErrorHandlerMiddleware(loggerInstance));

const server = app.listen(port, () => {
  loggerInstance.info('='.repeat(50));
  loggerInstance.info(`🚀 API Server running at: http://localhost:${port}`);
  loggerInstance.info(
    `📚 Documentation available at: http://localhost:${port}/docs`
  );
  loggerInstance.info('='.repeat(50));
});

process.on('SIGTERM', () => {
  loggerInstance.info('Received SIGTERM signal. Shutting down server...');
  server.close(() => {
    loggerInstance.info('Server shut down successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  loggerInstance.info('Received SIGINT signal. Shutting down server...');
  server.close(() => {
    loggerInstance.info('Server shut down successfully');
    process.exit(0);
  });
});

export default app;
