import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ErrorResponseFilter } from './middlewares/error.middleware';
import { ResponseInterceptor } from './middlewares/response.middleware';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Calendax-Revamp')
    .setVersion('1.0')
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer'
    })
    .addSecurityRequirements('bearer')
    .addTag('cats')
    .build()
  
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  app.set('trust proxy', 1);
 app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});
  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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
  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT, () =>
    console.log(`Server listening on port: ${PORT}`),
  );
}
bootstrap();
