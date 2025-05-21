import { PartialType } from '@nestjs/swagger';
import { CreateCultivationDto } from './create-cultivation.dto';

export class UpdateCultivationDto extends PartialType(CreateCultivationDto) {}
