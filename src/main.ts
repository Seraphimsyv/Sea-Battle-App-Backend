import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
