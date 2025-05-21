import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRuralPropertyDto {
  @ApiProperty({ example: 'Fazendo sol nascente' })
  @IsString({ message: 'Nome da fazenda deve ser uma string' })
  @IsNotEmpty()
  farm_name: string;

  @ApiProperty({ example: '8' })
  @IsNumber({}, { message: 'Área total deve ser um número' })
  @Min(0, { message: 'Área total não pode ser negativa' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(',', '.'));
      if (!isNaN(parsed)) return parsed;
    }

    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }

    return 0;
  })
  total_area: number;

  @ApiProperty({ example: '4' })
  @IsNumber({}, { message: 'Área cultivável deve ser um número' })
  @Min(0, { message: 'Área total não pode ser negativa' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(',', '.'));
      if (!isNaN(parsed)) return parsed;
    }

    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }

    return 0;
  })
  arable_area: number;

  @ApiProperty({ example: '4' })
  @IsNumber({}, { message: 'Área de vegetação deve ser um número' })
  @Min(0, { message: 'Área total não pode ser negativa' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(',', '.'));
      if (!isNaN(parsed)) return parsed;
    }

    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }

    return 0;
  })
  vegetation_area: number;

  @ApiProperty({ example: '1' })
  @IsNumber({}, { message: 'ID do produtor é obrigatório' })
  @IsNotEmpty()
  producerId: number;

  @ApiProperty({ example: '1' })
  @IsNumber({}, { message: 'ID da cidade é obrigatório' })
  @IsNotEmpty()
  cityId: number;
}
