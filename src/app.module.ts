import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { AuthModule } from './auth/auth.module';
import { WsGameModule } from './ws-game/ws-game.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';


@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    WsGameModule,
  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
})
export class AppModule {}
