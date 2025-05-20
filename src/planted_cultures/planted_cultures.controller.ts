import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PlantedCulturesService } from './planted_cultures.service';
import { CreatePlantedCultureDto } from './dto/create-planted_culture.dto';
import { UpdatePlantedCultureDto } from './dto/update-planted_culture.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('planted-cultures')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('planted-cultures')
export class PlantedCulturesController {
  constructor(
    private readonly plantedCulturesService: PlantedCulturesService,
  ) {}

  @Post()
  create(
    @Body() createPlantedCultureDto: CreatePlantedCultureDto,
    @User() user: JwtPayload,
  ) {
    return this.plantedCulturesService.create(
      createPlantedCultureDto,
      user.sub,
    );
  }

  @Get()
  findAll() {
    return this.plantedCulturesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plantedCulturesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlantedCultureDto: UpdatePlantedCultureDto,
  ) {
    return this.plantedCulturesService.update(+id, updatePlantedCultureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plantedCulturesService.remove(+id);
  }
}
