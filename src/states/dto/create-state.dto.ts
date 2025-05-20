import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStateDto {
  @ApiProperty({ example: 'GO' })
  @IsString()
  @IsNotEmpty()
  uf: string;

  @ApiProperty({ example: 'Goias' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
