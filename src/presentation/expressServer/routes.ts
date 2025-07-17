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
  createAuthRateLimitMiddleware,
} from '../middlewares/AuthMiddleware';
import {
  requireAdmin,
  requireManager,
  requireSupervisor,
  requireUser,
  requireAuditor,
  requireViewer,
  requireWritePermissions,
  requireReadPermissions,
} from '../middlewares/RoleMiddleware';
import { WinstonLogger } from '../../infrastructure/logger/WinstonLogger';
import { cacheMiddleware } from '../middlewares/CacheMiddleware';
import { GetProductByIdUseCase } from '../../core/application/usecase/product/GetProductByIdUseCase';
import { ListProductsUseCase } from '../../core/application/usecase/product/ListProductsUseCase';
import { CreateProductUseCase } from '../../core/application/usecase/product/CreateProductUseCase';
import { UpdateProductUseCase } from '../../core/application/usecase/product/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../core/application/usecase/product/DeleteProductUseCase';
import { IProductRepository } from '../../core/domain/repository/ProductRepository';
import { ProductRepositoryImpl } from '../../infrastructure/services/ProductRepositoryImpl';

const router: Router = Router();
const logger = new WinstonLogger();
const productRepository: IProductRepository = new ProductRepositoryImpl();

const getProductByIdUseCase = new GetProductByIdUseCase(productRepository, logger);
const listProductsUseCase = new ListProductsUseCase(productRepository, logger);
const createProductUseCase = new CreateProductUseCase(productRepository, logger);
const updateProductUseCase = new UpdateProductUseCase(productRepository, logger);
const deleteProductUseCase = new DeleteProductUseCase(productRepository, logger);

const productController = new ProductController(
  getProductByIdUseCase,
  listProductsUseCase,
  createProductUseCase,
  updateProductUseCase,
  deleteProductUseCase
);

const authController = new AuthController();
const userController = new UserController();
const categoryController = new CategoryController();
const supplierController = new SupplierController();
const locationController = new LocationController();
const productMovementController = new ProductMovementController();
const auditLogController = new AuditLogController();

const authMiddleware = createAuthMiddleware(logger);
const authRateLimit = createAuthRateLimitMiddleware();

const cacheConfig = {
  products: { ttl: 300 },
  categories: { ttl: 600 },
  locations: { ttl: 600 },
  suppliers: { ttl: 600 },
  auditLogs: { ttl: 60 },
};

router.post('/auth/register', authRateLimit as RequestHandler, (req, res, next) => {
  console.log('DEBUG: Route /auth/register - req.body:', JSON.stringify(req.body, null, 2));
  next();
}, authController.register as RequestHandler);
router.post('/auth/login', authRateLimit as RequestHandler, authController.login as RequestHandler);
router.post('/auth/refresh', authRateLimit as RequestHandler, authController.refresh as RequestHandler);

// =====================================================
// RUTAS DE USUARIOS (solo ADMIN)
// =====================================================
router.get(
  '/users',
  authMiddleware as RequestHandler[],
  requireAdmin,
  cacheMiddleware(300),
  userController.listUsers as RequestHandler
);
router.get(
  '/users/:id',
  authMiddleware as RequestHandler[],
  requireAdmin,
  userController.getUserById as RequestHandler
);
router.post(
  '/users',
  authMiddleware as RequestHandler[],
  requireAdmin,
  userController.createUser as RequestHandler
);
router.put(
  '/users/:id',
  authMiddleware as RequestHandler[],
  requireAdmin,
  userController.updateUser as RequestHandler
);
router.delete(
  '/users/:id',
  authMiddleware as RequestHandler[],
  requireAdmin,
  userController.deleteUser as RequestHandler
);

// =====================================================
// RUTAS DE CATEGORÍAS (ADMIN, MANAGER, USER)
// =====================================================
router.get(
  '/categories',
  authMiddleware as RequestHandler[],
  requireReadPermissions,
  cacheMiddleware(300),
  categoryController.listCategories as RequestHandler
);
router.get(
  '/categories/:id',
  authMiddleware as RequestHandler[],
  requireReadPermissions,
  categoryController.getCategoryById as RequestHandler
);
router.post(
  '/categories',
  authMiddleware as RequestHandler[],
  requireWritePermissions,
  categoryController.createCategory as RequestHandler
);
router.put(
  '/categories/:id',
  authMiddleware as RequestHandler[],
  requireWritePermissions,
  categoryController.updateCategory as RequestHandler
);
router.delete(
  '/categories/:id',
  authMiddleware as RequestHandler[],
  requireAdmin,
  categoryController.deleteCategory as RequestHandler
);

// =====================================================
// RUTAS DE UBICACIONES (ADMIN, MANAGER, USER)
// =====================================================
router.get(
  '/locations',
  authMiddleware as RequestHandler[],
  requireReadPermissions,
  cacheMiddleware(300),
  locationController.listLocations as RequestHandler
);
router.get(
  '/locations/:id',
  authMiddleware as RequestHandler[],
  requireReadPermissions,
  locationController.getLocationById as RequestHandler
);
router.post(
  '/locations',
  authMiddleware as RequestHandler[],
  requireWritePermissions,
  locationController.createLocation as RequestHandler
);
router.put(
  '/locations/:id',
  authMiddleware as RequestHandler[],
  requireWritePermissions,
  locationController.updateLocation as RequestHandler
);
router.delete(
  '/locations/:id',
  authMiddleware as RequestHandler[],
  requireAdmin,
  locationController.deleteLocation as RequestHandler
);

// =====================================================
// RUTAS DE PROVEEDORES (ADMIN, MANAGER, USER)
// =====================================================
router.get(
  '/suppliers',
  authMiddleware as RequestHandler[],
  requireReadPermissions,
  cacheMiddleware(300),
  supplierController.listSuppliers as RequestHandler
);
router.get(
  '/suppliers/:id',
  authMiddleware as RequestHandler[],
  requireReadPermissions,
  supplierController.getSupplierById as RequestHandler
);
router.post(
  '/suppliers',
  authMiddleware as RequestHandler[],
  requireWritePermissions,
  supplierController.createSupplier as RequestHandler
);
router.put(
  '/suppliers/:id',
  authMiddleware as RequestHandler[],
  requireWritePermissions,
  supplierController.updateSupplier as RequestHandler
);
router.delete(
  '/suppliers/:id',
  authMiddleware as RequestHandler[],
  requireAdmin,
  supplierController.deleteSupplier as RequestHandler
);

// =====================================================
// RUTAS DE PRODUCTOS (ADMIN, MANAGER, SUPERVISOR, USER)
// =====================================================
router.get(
  '/products',
  authMiddleware as RequestHandler[],
  requireReadPermissions,
  cacheMiddleware(300),
  productController.list as RequestHandler
);
router.get(
  '/products/:id',
  authMiddleware as RequestHandler[],
  requireReadPermissions,
  productController.getById as RequestHandler
);
router.post(
  '/products',
  authMiddleware as RequestHandler[],
  requireWritePermissions,
  productController.create as RequestHandler
);
router.put(
  '/products/:id',
  authMiddleware as RequestHandler[],
  requireWritePermissions,
  productController.update as RequestHandler
);
router.delete(
  '/products/:id',
  authMiddleware as RequestHandler[],
  requireAdmin,
  productController.delete as RequestHandler
);

// =====================================================
// RUTAS DE MOVIMIENTOS DE PRODUCTOS (ADMIN, MANAGER, USER)
// =====================================================
router.get(
  '/product-movements',
  authMiddleware as RequestHandler[],
  requireReadPermissions,
  cacheMiddleware(300),
  productMovementController.listProductMovements as RequestHandler
);
router.get(
  '/product-movements/:id',
  authMiddleware as RequestHandler[],
  requireReadPermissions,
  productMovementController.getProductMovementById as RequestHandler
);
router.post(
  '/product-movements',
  authMiddleware as RequestHandler[],
  requireWritePermissions,
  productMovementController.createProductMovement as RequestHandler
);
router.get(
  '/product-movements/by-product/:productId',
  authMiddleware as RequestHandler[],
  requireReadPermissions,
  productMovementController.listProductMovementsByProduct as RequestHandler
);
router.get(
  '/product-movements/by-user/:userId',
  authMiddleware as RequestHandler[],
  requireReadPermissions,
  productMovementController.listProductMovementsByUser as RequestHandler
);

// =====================================================
// RUTAS DE LOGS DE AUDITORÍA (ADMIN, AUDITOR)
// =====================================================
router.get(
  '/audit-logs',
  authMiddleware as RequestHandler[],
  requireAuditor,
  cacheMiddleware(300),
  auditLogController.listAuditLogs as RequestHandler
);

// =====================================================
// RUTA DE HEALTH CHECK
// =====================================================
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Industrial Inventory API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
  });
});

export { router as default };
