import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // <--- FIX FOR FLUTTER WEB
  app.useWebSocketAdapter(new WsAdapter(app)); // <--- FIX FOR TWILIO RAW AUDIO STREAMS
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
