import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Validate } from 'class-validator';
import { IsCpfOrCnpj } from '../../common/validators/is-cpf-or-cnpj.validator';

export class CreateProducerDto {
  @ApiProperty({ example: '98978945688' })
  @IsString()
  @IsNotEmpty()
  @Validate(IsCpfOrCnpj)
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
