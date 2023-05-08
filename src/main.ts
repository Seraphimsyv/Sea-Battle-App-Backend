import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "*",
    credentials: true
  })
  app.use('/', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    })
  await app.listen(3000);
}
bootstrap();
