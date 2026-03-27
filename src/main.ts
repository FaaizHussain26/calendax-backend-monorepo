import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ErrorResponseFilter } from './middlewares/error.middleware';
import { ResponseInterceptor } from './middlewares/response.middleware';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    app.use(helmet());
  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
  });
 
  //HANDLE AND VALIDATING DTOS
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // GLOBAL ERROR HANDLER
  app.useGlobalFilters(new ErrorResponseFilter());
 
  // Apply global interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());
 
  // GLOBAL API PREFIX
  app.setGlobalPrefix('api');
 
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
