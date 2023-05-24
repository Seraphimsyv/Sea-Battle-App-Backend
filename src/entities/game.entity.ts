import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  finishAt: Date;

  @Column({ unique: false })
  steps: number;

  @Column({ unique: false })
  winner: 0 | 1;

  @Column({ nullable: false, unique: false })
  firstPlayer: number;

  @Column({ nullable: false, unique: false })
  firstPlayerPoints: number;

  @Column({ nullable: false, unique: false })
  secondPlayer: number;

  @Column({ nullable: false, unique: false })
  secondPlayerPoints: number;
}