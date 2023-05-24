import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { WsGameController } from './ws-game.controllers';
import { WsGameGateway } from './ws-game.gateway';
import { WsGameService } from './ws-game.service';
import { Game } from 'src/entities/game.entity';
import { GlobalGameProvider } from './ws-game.global';
import { jwtConstants } from 'src/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' }
    }),
    UsersModule,
  ],
  controllers: [WsGameController],
  providers: [WsGameService, WsGameGateway, GlobalGameProvider],
  exports: [GlobalGameProvider]
})
export class WsGameModule {}