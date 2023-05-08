import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { WsChatModule } from 'src/ws-chat/ws-chat.module';
import { JwtModule } from '@nestjs/jwt';
import { WsGameGateway } from './ws-game.gateway';
import { WsGameService } from './ws-game.service';
import { Game } from 'src/entities/game.entity';
import { jwtConstants } from 'src/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' }
    }),
    UsersModule,
    WsChatModule
  ],
  providers: [WsGameGateway, WsGameService]
})
export class WsGameModule {}