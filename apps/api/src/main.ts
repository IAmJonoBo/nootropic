import { NestFactory } from '@nestjs/core';
import { Logger } from '@nootropic/runtime';
import { AppModule } from './app.module';

/**
 * @todo Implement API server
 * - Configure NestJS application
 * - Set up middleware and interceptors
 * - Initialize core services
 * - Configure OpenAPI/Swagger
 * - Set up health checks
 */

const logger = new Logger('api');

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // TODO: Configure global middleware
    // TODO: Set up OpenAPI documentation
    // TODO: Configure CORS
    // TODO: Set up health checks
    
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.info(`API server listening on port ${port}`);
  } catch (error) {
    logger.error('Failed to start API server', error);
    process.exit(1);
  }
}

bootstrap();
