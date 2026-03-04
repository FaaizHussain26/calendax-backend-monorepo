import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app/app.module';
import * as dotenv from "dotenv";


dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Calendax API')
    .setDescription('The Calendax API description')
    .setVersion('1.0')
    .addSecurity("bearer", {
      type: "http",
      scheme: "bearer"
    })
    .addSecurityRequirements("bearer")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
