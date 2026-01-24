import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ВОТ ЭТА СТРОКА РЕШАЕТ ПРОБЛЕМУ:
  app.enableCors({
    origin: 'http://localhost:5173', // адрес твоего фронтенда
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();