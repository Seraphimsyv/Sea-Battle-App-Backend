import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany
} from "typeorm";
import { Game } from "./game.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: false })
  login: string;

  @Column({ nullable: false })
  password: string;

  @OneToMany(() => Game, game => game.winner)
  wonGames: Game[];

  @OneToMany(() => Game, game => game.loser)
  loseGames: Game[];
}