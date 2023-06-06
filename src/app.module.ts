import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { AppService } from './app.service';


@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    GameModule,
  ],
  providers: [
    AppService
  ],
})
export class AppModule {}
