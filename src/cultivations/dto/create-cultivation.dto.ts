import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCultivationDto {
  @ApiProperty({ example: '1' })
  @IsNumber({}, { message: 'ID da propriedade rural é obrigatório' })
  @IsNotEmpty()
  rural_propertyId: number;

  @ApiProperty({ example: '1' })
  @IsNumber({}, { message: 'ID da safra é obrigatório' })
  @IsNotEmpty()
  harvestId: number;

  @ApiProperty({ example: '1' })
  @IsNumber({}, { message: 'ID da cultura plantada é obrigatório' })
  @IsNotEmpty()
  planted_cultureId: number;
}
