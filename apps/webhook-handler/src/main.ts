import { NestFactory } from '@nestjs/core';
import { WebhookAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(WebhookAppModule);
  await app.listen(3003);
}
bootstrap();
