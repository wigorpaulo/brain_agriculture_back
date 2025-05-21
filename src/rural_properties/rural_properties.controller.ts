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
import { RuralPropertiesService } from './rural_properties.service';
import { CreateRuralPropertyDto } from './dto/create-rural_property.dto';
import { UpdateRuralPropertyDto } from './dto/update-rural_property.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('rural-properties')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('rural-properties')
export class RuralPropertiesController {
  constructor(
    private readonly ruralPropertiesService: RuralPropertiesService,
  ) {}

  @Post()
  create(
    @Body() createRuralPropertyDto: CreateRuralPropertyDto,
    @User() user: JwtPayload,
  ) {
    return this.ruralPropertiesService.create(createRuralPropertyDto, user.sub);
  }

  @Get()
  findAll() {
    return this.ruralPropertiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ruralPropertiesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRuralPropertyDto: UpdateRuralPropertyDto,
  ) {
    return this.ruralPropertiesService.update(+id, updateRuralPropertyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ruralPropertiesService.remove(+id);
  }
}
