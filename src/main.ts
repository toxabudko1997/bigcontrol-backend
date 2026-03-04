import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TODO: заменить origin на адрес вашего фронта на Firebase
  app.enableCors({
    origin: true, // временно true, позже сузим
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();