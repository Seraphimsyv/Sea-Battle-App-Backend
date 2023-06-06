import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { GameController } from './game.controllers';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { Game } from 'src/entities/game.entity';
import { GlobalGameProvider, GlobalChatProvider } from './game.global';
import { jwtConstants } from 'src/constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/entities/users.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Game, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        secret: jwtConstants.secret,
        signOptions: {
          expiresIn: `${jwtConstants.expiresIn}s`,
        },
      }),
    }),
  ],
  controllers: [GameController],
  providers: [GameService, GameGateway, GlobalGameProvider, GlobalChatProvider, AuthService, UsersService]
})
export class GameModule {}