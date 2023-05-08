import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { WsChatGateway } from './ws-chat.gateway';
import { WsChatService } from './ws-chat.service';
import { Chat } from 'src/entities/chats.entity';
import { jwtConstants } from 'src/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat]),
    UsersModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' }
    })
  ],
  providers: [WsChatGateway, WsChatService],
})
export class WsChatModule {}
