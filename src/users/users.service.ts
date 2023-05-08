import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/users.entity';

type CreateUserData = {
  username: string, login: string, password: string
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}
  /**
   * 
   * @param username 
   * @returns 
   */
  async findOne( username: string ): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { username: username }});
    return user;
  }
  /**
   * 
   * @param userData 
   * @returns 
   */
  async createUser( userData: CreateUserData ) {
    const newUser = await this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);
    return newUser;
  }
  /**
   * 
   * @param username 
   * @returns 
   */
  async getProfile( username: string ) {
    const user = await this.findOne(username);
    return {
      ...user,
      password: undefined
    }
  }
}