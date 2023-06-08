import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/users.entity';
import { Game } from 'src/entities/game.entity';
import { RegisterData } from 'src/types/auth.types';
import { HttpException } from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger();

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
  ) {}
  /**
   * Searching for a user in the database
   * @param username 
   * @returns 
   */
  async findOne(input: number);
  async findOne(input: string);
  async findOne(input: string | number): Promise<User | undefined> {
    try {
      if (typeof input === 'number') {
        return await this.usersRepository.findOne({ where: { id: input }});
      }
      
      if (typeof input === 'string') {
        return await this.usersRepository.findOne({ where: { login: input }});
      }
    } catch (err) {
      throw new HttpException('User Search Database Error.', HttpStatus.UNAUTHORIZED);
    }
  }
  /**
   * Getting a user in the database by id
   * @param id 
   * @returns 
   */
  async getById(id: number) {
    try {
      const user = await this.usersRepository.findOne({ where: { id: id }});
      
      if (user) {
        return user;
      } else {
        throw new HttpException('User Not Found by ID', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException('User Search Database Error (by ID)', HttpStatus.BAD_REQUEST);
    }
  }
  /**
   * User creation
   * @param userData 
   * @returns 
   */
  async createUser(registerData: RegisterData) {

    const anotherUser = await this.findOne(registerData.login);

    if (anotherUser) {
      throw new HttpException('ERROR:USER_EXISTS', HttpStatus.BAD_REQUEST);
    }
    
    try {
      const newUser = await this.usersRepository.create(registerData);
      await this.usersRepository.save(newUser);
      return newUser;
    } catch (error) {
      switch (Number(error.code)) {
        case 23505:
          throw new HttpException('ERROR:USER_EXISTS', HttpStatus.BAD_REQUEST);
        default:
          throw new HttpException('ERROR:DATABASE', HttpStatus.BAD_REQUEST);
      }
    }
  }
  /**
   * Getting a user profile
   * @param username 
   * @returns 
   */
  async getProfile(login: string) {
    const user = await this.findOne(login);
    
    return {
      ...user,
      password: undefined
    }
  }
  /**
   * Getting a user game statistic
   * @param user 
   */
  async getGamesStatistic(user: User) {
    const data = {
      points: 0,
      games: {
        total: 0,
        wone: 0,
        lose: 0
      }
    };

    const wonGames = await this.gameRepository.find({ where: { winner: user }});
    wonGames.forEach(game => {
      data.points += game.winnerPoints;
      data.games.total += 1;
      data.games.wone += 1;
    })

    const loseGames = await this.gameRepository.find({ where: { loser: user }});
    loseGames.forEach(game => {
      data.points += game.loserPoints;
      data.games.total += 1;
      data.games.lose += 1;
    })

    return data;
  }
  /**
   * Getting a user game history
   * @param user 
   */
  async getGamesHistory(user: User) {
    const data = [];
    
    const wonGames = await this.gameRepository.find({ where: { winner: user }});
    wonGames.forEach(game => {
      data.push({ ...game, winnerStatus: 1 })
    })

    const loseGames = await this.gameRepository.find({ where: { loser: user }});
    loseGames.forEach(game => {
      data.push({ ...game, winnerStatus: 0 })
    })

    data.sort((a: Game, b: Game) => {
      return a.id - b.id;
    })

    return data;
  }
}