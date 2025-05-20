import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePlantedCultureDto {
  @ApiProperty({ example: 'Soja' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
