import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ example: '<EMAIL>' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '<PASSWORD>' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
