import { NestFactory } from '@nestjs/core';
import { CallProcessorAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(CallProcessorAppModule);
 const PORT=3003
  await app.listen(PORT,()=>console.log(`Schedular listening on ${PORT}`))}
bootstrap();