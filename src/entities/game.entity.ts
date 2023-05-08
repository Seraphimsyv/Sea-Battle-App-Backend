import {
  Entity,
  Column,
  JoinTable,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToMany,
} from "typeorm";
import { randomBytes } from "crypto";
import { User } from "./users.entity";

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  password: string;
  
  @Column()
  steps: number;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn({ nullable: true, default: null })
  finushAt: Date;

  @Column({ nullable: true })
  finish_type: 0 | 1; // PLAYER WIN | AUTO WIN

  @ManyToMany(() => User, (user) => user.games)
  @JoinTable()
  users: User[];
}