import { IsString, IsNotEmpty} from 'class-validator';

export class LoginDtoData {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegistrationDtoData {
  @IsString()
  @IsNotEmpty()
  username: string;
  
  @IsString()
  @IsNotEmpty()
  login: string;
  
  @IsString()
  @IsNotEmpty()
  password: string;
}