import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHarvestDto {
  @ApiProperty({ example: 'Safra 2021' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
