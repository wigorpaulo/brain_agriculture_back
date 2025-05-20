import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { HarvestsService } from './harvests.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('harvests')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('harvests')
export class HarvestsController {
  constructor(private readonly harvestsService: HarvestsService) {}

  @Post()
  create(@Body() createHarvestDto: CreateHarvestDto, @Request() req) {
    return this.harvestsService.create(createHarvestDto, req);
  }

  @Get()
  findAll() {
    return this.harvestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.harvestsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHarvestDto: UpdateHarvestDto) {
    return this.harvestsService.update(+id, updateHarvestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.harvestsService.remove(+id);
  }
}
