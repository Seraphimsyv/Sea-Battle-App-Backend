import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from 'src/entities/chats.entity';

@Injectable()
export class WsChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>
  ) {}
}