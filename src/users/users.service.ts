import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/users.entity';
import {
  Login,
  UserData
} from './types';

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
  async findOne(login: Login): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { login: login }});
    
    return user;
  }
  /**
   * 
   * @param userData 
   * @returns 
   */
  async createUser(userData: UserData) {
    const newUser = await this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);

    return newUser;
  }
  /**
   * 
   * @param username 
   * @returns 
   */
  async getProfile(login: Login) {
    const user = await this.findOne(login);
    
    return {
      ...user,
      password: undefined
    }
  }
}