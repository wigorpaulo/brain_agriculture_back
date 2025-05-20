import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProducerDto {
  @ApiProperty({ example: '98978945688' })
  @IsString()
  @IsNotEmpty()
  cpf_cnpj: string;

  @ApiProperty({ example: 'Soja' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1' })
  @IsNumber()
  @IsNotEmpty()
  city_id: number;
}
