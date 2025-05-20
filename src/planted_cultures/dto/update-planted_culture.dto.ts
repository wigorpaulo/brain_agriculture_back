import { PartialType } from '@nestjs/swagger';
import { CreatePlantedCultureDto } from './create-planted_culture.dto';

export class UpdatePlantedCultureDto extends PartialType(CreatePlantedCultureDto) {}
