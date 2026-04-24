import { NestFactory } from '@nestjs/core';
import { SchedulerAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(SchedulerAppModule);
  const PORT=3002
  await app.listen(PORT,()=>console.log(`Schedular listening on ${PORT}`))
}
bootstrap();
