import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/entities/users.entity';
import { Game } from 'src/entities/game.entity';
import { JwtStrategy } from 'src/strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConstants } from 'src/constants';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Game]),
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
  controllers: [UsersController],
  providers: [UsersService, AuthService, JwtStrategy],
  exports: [UsersService, JwtStrategy],
})
export class UsersModule {}