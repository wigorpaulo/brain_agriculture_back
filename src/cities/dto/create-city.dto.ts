import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({ example: 'Goiania' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1' })
  @IsNumber()
  @IsNotEmpty()
  state_id: number;
}
