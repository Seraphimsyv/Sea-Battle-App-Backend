import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { AuthModule } from './auth/auth.module';
import { WsGameModule } from './ws-game/ws-game.module';
import { AppService } from './app.service';


@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    WsGameModule,
  ],
  providers: [
    AppService
  ],
})
export class AppModule {}
