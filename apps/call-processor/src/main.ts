import { NestFactory } from '@nestjs/core';
import { CallProcessorAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(CallProcessorAppModule);
  await app.listen(3003);
}
bootstrap();
