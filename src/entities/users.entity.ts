import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany
} from "typeorm";
import { Chat } from "./chats.entity";
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

  @OneToMany(() => Chat, (chats) => chats.sender)
  chats: Chat[];
}