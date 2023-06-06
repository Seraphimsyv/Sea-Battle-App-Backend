import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { User } from "./users.entity";

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  finishAt: Date;

  @Column({ unique: false })
  steps: number;

  @ManyToOne(() => User, winner => winner.wonGames)
  @JoinColumn()
  winner: User;

  @Column({ nullable: true })
  winnerPoints: number;

  @ManyToOne(() => User, loser => loser.loseGames)
  @JoinColumn()
  loser: User;

  @Column({ nullable: true })
  loserPoints: number;
}