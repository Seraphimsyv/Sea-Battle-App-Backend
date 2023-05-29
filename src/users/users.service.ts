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
   * Searching for a user in the database
   * @param username 
   * @returns 
   */
  async findOne(input: number);
  async findOne(input: string);
  async findOne(input: Login | number): Promise<User | undefined> {
    if (typeof input === 'number') {
      const user = await this.usersRepository.findOne({ where: { id: input }});

      return user;
    }
    if (typeof input === 'string') {
      const user = await this.usersRepository.findOne({ where: { login: input }});
    
      return user;
    }
  }
  /**
   * User creation
   * @param userData 
   * @returns 
   */
  async createUser(userData: UserData) {
    const newUser = await this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);

    return newUser;
  }
  /**
   * Getting a user profile
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