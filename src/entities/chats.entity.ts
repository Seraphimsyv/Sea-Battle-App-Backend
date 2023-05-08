import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./users.entity";
import { Game } from "./game.entity";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (sender) => sender.chats)
  sender: User;
}