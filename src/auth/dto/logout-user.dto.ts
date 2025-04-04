import { IsString } from 'class-validator';

export class LogoutUserDto {
  @IsString()
  token: string;
}
