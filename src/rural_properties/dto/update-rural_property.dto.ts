import { PartialType } from '@nestjs/swagger';
import { CreateRuralPropertyDto } from './create-rural_property.dto';

export class UpdateRuralPropertyDto extends PartialType(CreateRuralPropertyDto) {}
