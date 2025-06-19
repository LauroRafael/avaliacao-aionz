// (global as any).crypto = require('crypto');
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create(AppModule, { cors: true });
  
  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true, // Converte automaticamente os tipos
      whitelist: true, // Remove propriedades não declaradas no DTO
      forbidNonWhitelisted: true // Rejeita requisições com propriedades não declaradas
    }
  ));
  
  const config = new DocumentBuilder()
    .setTitle('API de Produtos')
    .setDescription('API para gerenciar produtos')
    .setVersion('1.0')
    .addTag('products')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();