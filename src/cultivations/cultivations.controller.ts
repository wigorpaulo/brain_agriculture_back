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
import { CultivationsService } from './cultivations.service';
import { CreateCultivationDto } from './dto/create-cultivation.dto';
import { UpdateCultivationDto } from './dto/update-cultivation.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('cultivations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('cultivations')
export class CultivationsController {
  constructor(private readonly cultivationsService: CultivationsService) {}

  @Post()
  create(
    @Body() createCultivationDto: CreateCultivationDto,
    @User() user: JwtPayload,
  ) {
    return this.cultivationsService.create(createCultivationDto, user.sub);
  }

  @Get()
  findAll() {
    return this.cultivationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cultivationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCultivationDto: UpdateCultivationDto,
  ) {
    return this.cultivationsService.update(+id, updateCultivationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cultivationsService.remove(+id);
  }
}
