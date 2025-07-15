/**
 * @fileoverview Configuración de rutas
 * @author Daisy Castillo
 * @version 1.0.0
 */

import { Router, RequestHandler } from 'express';
import { AuthController } from '../controller/AuthController';
import { UserController } from '../controller/UserController';
import { CategoryController } from '../controller/CategoryController';
import { SupplierController } from '../controller/SupplierController';
import { LocationController } from '../controller/LocationController';
import { ProductController } from '../controller/ProductController';
import { ProductMovementController } from '../controller/ProductMovementController';
import { AuditLogController } from '../controller/AuditLogController';
import {
  createAuthMiddleware,
  createRoleMiddleware,
} from '../middlewares/AuthMiddleware';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';
import { cacheMiddleware } from '../middlewares/CacheMiddleware';

const router = Router();
const loggerInstance = new WinstonLogger();

// Instanciar controladores
const authController = new AuthController();
const userController = new UserController();
const productController = new ProductController();
const categoryController = new CategoryController();
const supplierController = new SupplierController();
const locationController = new LocationController();
const productMovementController = new ProductMovementController();
const auditLogController = new AuditLogController();

// Crear instancias de middlewares con los 3 roles
const authMiddleware = createAuthMiddleware(loggerInstance);
const adminOnly = createRoleMiddleware(['ADMIN']);
const adminAndUser = createRoleMiddleware(['ADMIN', 'USER']);
const adminUserAndViewer = createRoleMiddleware(['ADMIN', 'USER', 'VIEWER']);
const viewerOnly = createRoleMiddleware(['VIEWER']);

// Configuración de caché por ruta
const cacheConfig = {
  products: { ttl: 300 }, // 5 minutos
  categories: { ttl: 600 }, // 10 minutos
  locations: { ttl: 600 }, // 10 minutos
  suppliers: { ttl: 600 }, // 10 minutos
  auditLogs: { ttl: 60 }, // 1 minuto
};

// Rutas de autenticación (sin caché)
router.post('/auth/register', authController.register as RequestHandler);
router.post('/auth/login', authController.login as RequestHandler);
router.post('/auth/refresh', authController.refresh as RequestHandler);

// Rutas de usuarios
router.get(
  '/users',
  authMiddleware as RequestHandler[],
  adminOnly as RequestHandler,
  cacheMiddleware(300),
  userController.listUsers as RequestHandler
);
router.get(
  '/users/:id',
  authMiddleware as RequestHandler[],
  adminOnly as RequestHandler,
  userController.getUserById as RequestHandler
);
router.post(
  '/users',
  authMiddleware as RequestHandler[],
  adminOnly as RequestHandler,
  userController.createUser as RequestHandler
);
router.put(
  '/users/:id',
  authMiddleware as RequestHandler[],
  adminOnly as RequestHandler,
  userController.updateUser as RequestHandler
);
router.delete(
  '/users/:id',
  authMiddleware as RequestHandler[],
  adminOnly as RequestHandler,
  userController.deleteUser as RequestHandler
);

// Rutas de productos
router.get(
  '/products',
  authMiddleware as RequestHandler[],
  adminUserAndViewer as RequestHandler,
  cacheMiddleware(cacheConfig.products.ttl),
  productController.listProducts as RequestHandler
);
router.get(
  '/products/:id',
  authMiddleware as RequestHandler[],
  adminUserAndViewer as RequestHandler,
  cacheMiddleware(cacheConfig.products.ttl),
  productController.getProductById as RequestHandler
);
router.post(
  '/products',
  authMiddleware as RequestHandler[],
  adminAndUser as RequestHandler,
  productController.createProduct as RequestHandler
);
router.put(
  '/products/:id',
  authMiddleware as RequestHandler[],
  adminAndUser as RequestHandler,
  productController.updateProduct as RequestHandler
);
router.delete(
  '/products/:id',
  authMiddleware as RequestHandler[],
  adminOnly as RequestHandler,
  productController.deleteProduct as RequestHandler
);

// Rutas de categorías
router.get(
  '/categories',
  authMiddleware as RequestHandler[],
  adminUserAndViewer as RequestHandler,
  cacheMiddleware(cacheConfig.categories.ttl),
  categoryController.listCategories as RequestHandler
);
router.get(
  '/categories/:id',
  authMiddleware as RequestHandler[],
  adminUserAndViewer as RequestHandler,
  cacheMiddleware(cacheConfig.categories.ttl),
  categoryController.getCategoryById as RequestHandler
);
router.post(
  '/categories',
  authMiddleware as RequestHandler[],
  adminAndUser as RequestHandler,
  categoryController.createCategory as RequestHandler
);
router.put(
  '/categories/:id',
  authMiddleware as RequestHandler[],
  adminAndUser as RequestHandler,
  categoryController.updateCategory as RequestHandler
);
router.delete(
  '/categories/:id',
  authMiddleware as RequestHandler[],
  adminOnly as RequestHandler,
  categoryController.deleteCategory as RequestHandler
);

// Rutas de ubicaciones
router.get(
  '/locations',
  authMiddleware as RequestHandler[],
  adminUserAndViewer as RequestHandler,
  cacheMiddleware(cacheConfig.locations.ttl),
  locationController.listLocations as RequestHandler
);
router.get(
  '/locations/:id',
  authMiddleware as RequestHandler[],
  adminUserAndViewer as RequestHandler,
  cacheMiddleware(cacheConfig.locations.ttl),
  locationController.getLocationById as RequestHandler
);
router.post(
  '/locations',
  authMiddleware as RequestHandler[],
  adminAndUser as RequestHandler,
  locationController.createLocation as RequestHandler
);
router.put(
  '/locations/:id',
  authMiddleware as RequestHandler[],
  adminAndUser as RequestHandler,
  locationController.updateLocation as RequestHandler
);
router.delete(
  '/locations/:id',
  authMiddleware as RequestHandler[],
  adminOnly as RequestHandler,
  locationController.deleteLocation as RequestHandler
);

// Rutas de proveedores
router.get(
  '/suppliers',
  authMiddleware as RequestHandler[],
  adminUserAndViewer as RequestHandler,
  cacheMiddleware(cacheConfig.suppliers.ttl),
  supplierController.listSuppliers as RequestHandler
);
router.get(
  '/suppliers/:id',
  authMiddleware as RequestHandler[],
  adminUserAndViewer as RequestHandler,
  cacheMiddleware(cacheConfig.suppliers.ttl),
  supplierController.getSupplierById as RequestHandler
);
router.post(
  '/suppliers',
  authMiddleware as RequestHandler[],
  adminAndUser as RequestHandler,
  supplierController.createSupplier as RequestHandler
);
router.put(
  '/suppliers/:id',
  authMiddleware as RequestHandler[],
  adminAndUser as RequestHandler,
  supplierController.updateSupplier as RequestHandler
);
router.delete(
  '/suppliers/:id',
  authMiddleware as RequestHandler[],
  adminOnly as RequestHandler,
  supplierController.deleteSupplier as RequestHandler
);

// Rutas de movimientos de productos
router.get(
  '/product-movements',
  authMiddleware as RequestHandler[],
  adminUserAndViewer as RequestHandler,
  productMovementController.listProductMovements as RequestHandler
);
router.get(
  '/product-movements/:id',
  authMiddleware as RequestHandler[],
  adminUserAndViewer as RequestHandler,
  productMovementController.getProductMovementById as RequestHandler
);
router.post(
  '/product-movements',
  authMiddleware as RequestHandler[],
  adminAndUser as RequestHandler,
  productMovementController.createProductMovement as RequestHandler
);
router.get(
  '/product-movements/by-product/:productId',
  authMiddleware as RequestHandler[],
  adminUserAndViewer as RequestHandler,
  productMovementController.listProductMovementsByProduct as RequestHandler
);
router.get(
  '/product-movements/by-user/:userId',
  authMiddleware as RequestHandler[],
  adminUserAndViewer as RequestHandler,
  productMovementController.listProductMovementsByUser as RequestHandler
);

// Rutas de logs de auditoría
router.get(
  '/audit-logs',
  authMiddleware as RequestHandler[],
  adminOnly as RequestHandler,
  cacheMiddleware(cacheConfig.auditLogs.ttl),
  auditLogController.listAuditLogs as RequestHandler
);

// Manejo de rutas no encontradas
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    error: 'NOT_FOUND',
  });
});

export default router;
