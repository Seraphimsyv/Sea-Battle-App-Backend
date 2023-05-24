import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from './entities/users.entity';
import { Game } from './entities/game.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'game',
      entities: [User, Game],
      synchronize: true,
    })
  ],
  controllers: [],
  providers: [],
})
export class DatabaseModule {}
