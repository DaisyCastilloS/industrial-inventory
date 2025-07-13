import { ExpressServer } from "../../04-presentation/expressServer/ExpressServer";
import { ProductController } from "../controller/ProductController";
import { ProductRepositoryImpl } from "../../03-infrastructure/services/ProductRepositoryImpl";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import express from "express";
import { createErrorHandlerMiddleware } from "../middlewares/ErrorHandlerMiddleware";
import { createRequestLoggerMiddleware } from "../middlewares/RequestLoggerMiddleware";
import { WinstonLogger } from "../../03-infrastructure/logger/WinstonLogger";
import { AuthController } from "../controller/AuthController";
import { UserRepositoryImpl } from "../../03-infrastructure/services/UserRepositoryImpl";

const port = Number(process.env.PORT) || 3000;
const server = new ExpressServer(port);
const loggerInstance = new WinstonLogger();
const productRepository = new ProductRepositoryImpl();
const productController = new ProductController(productRepository, loggerInstance);
const userRepository = new UserRepositoryImpl();
const authController = new AuthController(userRepository, loggerInstance);

// Cargar Swagger
const swaggerDocument = YAML.load(path.resolve(__dirname, "../../03-infrastructure/docs/swagger.yaml"));

// Exponemos app si se quiere usar express para middlewares como swagger
const app = server.getApp();

// Middlewares globales
server.useMiddleware(express.json());
server.useMiddleware(createRequestLoggerMiddleware(loggerInstance));
server.useMiddleware("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ruta de bienvenida
server.registerRoute("get", "/", (req, res) => {
    res.json({ message: "✅ Industrial Inventory API running" });
});

// Rutas Products
server.registerRoute("post", "/products", productController.createProduct);
server.registerRoute("get", "/products", productController.getAllProducts);
server.registerRoute("get", "/products/:id", productController.getProductById);
server.registerRoute("put", "/products/:id", productController.updateProduct);
server.registerRoute("delete", "/products/:id", productController.deleteProduct);

// Rutas Auth
server.registerRoute("post", "/auth/register", authController.registerUser);
server.registerRoute("post", "/auth/login", authController.loginUser);

// Manejo de errores
server.setErrorHandler(createErrorHandlerMiddleware(loggerInstance));

// Iniciar server
server.start();