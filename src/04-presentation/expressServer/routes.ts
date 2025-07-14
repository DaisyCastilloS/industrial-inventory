import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { UserController } from '../controller/UserController';
import { CategoryController } from '../controller/CategoryController';
import { SupplierController } from '../controller/SupplierController';
import { LocationController } from '../controller/LocationController';
import { ProductController } from '../controller/ProductController';
import { ProductMovementController } from '../controller/ProductMovementController';
import { AuditLogController } from '../controller/AuditLogController';
import { createAuthMiddleware, createRoleMiddleware } from '../middlewares/AuthMiddleware';
import { WinstonLogger } from '../../03-infrastructure/logger/WinstonLogger';

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

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authController.logout);

// Rutas protegidas - Users (solo ADMIN)
router.post('/users', authMiddleware, adminOnly, userController.createUser);
router.get('/users/:id', authMiddleware, adminOnly, userController.getUserById);
router.get('/users', authMiddleware, adminOnly, userController.listUsers);
router.put('/users/:id', authMiddleware, adminOnly, userController.updateUser);
router.delete('/users/:id', authMiddleware, adminOnly, userController.deleteUser);

// Rutas protegidas - Products (ADMIN y USER para modificar, todos pueden ver)
router.post('/products', authMiddleware, adminAndUser, productController.createProduct);
router.get('/products/:id', authMiddleware, adminUserAndViewer, productController.getProductById);
router.get('/products', authMiddleware, adminUserAndViewer, productController.listProducts);
router.put('/products/:id', authMiddleware, adminAndUser, productController.updateProduct);
router.delete('/products/:id', authMiddleware, adminOnly, productController.deleteProduct);

// Rutas protegidas - Categories (ADMIN y USER para modificar, todos pueden ver)
router.post('/categories', authMiddleware, adminAndUser, categoryController.createCategory);
router.get('/categories/:id', authMiddleware, adminUserAndViewer, categoryController.getCategoryById);
router.get('/categories', authMiddleware, adminUserAndViewer, categoryController.listCategories);
router.put('/categories/:id', authMiddleware, adminAndUser, categoryController.updateCategory);
router.delete('/categories/:id', authMiddleware, adminOnly, categoryController.deleteCategory);

// Rutas protegidas - Suppliers (ADMIN y USER para modificar, todos pueden ver)
router.post('/suppliers', authMiddleware, adminAndUser, supplierController.createSupplier);
router.get('/suppliers/:id', authMiddleware, adminUserAndViewer, supplierController.getSupplierById);
router.get('/suppliers', authMiddleware, adminUserAndViewer, supplierController.listSuppliers);
router.put('/suppliers/:id', authMiddleware, adminAndUser, supplierController.updateSupplier);
router.delete('/suppliers/:id', authMiddleware, adminOnly, supplierController.deleteSupplier);

// Rutas protegidas - Locations (ADMIN y USER para modificar, todos pueden ver)
router.post('/locations', authMiddleware, adminAndUser, locationController.createLocation);
router.get('/locations/:id', authMiddleware, adminUserAndViewer, locationController.getLocationById);
router.get('/locations', authMiddleware, adminUserAndViewer, locationController.listLocations);
router.put('/locations/:id', authMiddleware, adminAndUser, locationController.updateLocation);
router.delete('/locations/:id', authMiddleware, adminOnly, locationController.deleteLocation);

// Rutas protegidas - Product Movements (ADMIN y USER para crear, todos pueden ver)
router.post('/product-movements', authMiddleware, adminAndUser, productMovementController.createProductMovement);
router.get('/product-movements', authMiddleware, adminUserAndViewer, productMovementController.listProductMovements);
router.get('/product-movements/user/:userId', authMiddleware, adminUserAndViewer, productMovementController.listProductMovementsByUser);

// Rutas protegidas - Audit Logs (solo ADMIN)
router.get('/audit-logs', authMiddleware, adminOnly, auditLogController.listAuditLogs);

export default router; 