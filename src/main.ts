import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sea Battle Game API with NestJS')
    .setDescription('API developed on NestJS')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  // app.enableCors({
  //   origin: "*",
  //   credentials: true
  // })
  // app.use('/', (req, res) => {
  //   res.set('Access-Control-Allow-Origin', '*');
  //   })
  await app.listen(3000);
}
bootstrap();
