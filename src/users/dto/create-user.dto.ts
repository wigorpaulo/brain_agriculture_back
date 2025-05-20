import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'João' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '<EMAIL>' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '<PASSWORD>' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
