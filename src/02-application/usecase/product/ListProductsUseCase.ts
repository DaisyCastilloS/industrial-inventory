import { ProductRepository } from '../../../01-domain/repository/ProductRepository';
import { LoggerWrapperInterface } from '../../interface/LoggerWrapperInterface';

export class ListProductsUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly logger: LoggerWrapperInterface
  ) {}

  async execute(): Promise<any[]> {
    try {
      this.logger.info('📋 Executing ListProductsUseCase');
      const products = await this.productRepository.findAll();
      this.logger.info(`✅ Found ${products.length} products`);
      return products;
    } catch (error) {
      this.logger.error('❌ Error in ListProductsUseCase', { error });
      throw error;
    }
  }
} 