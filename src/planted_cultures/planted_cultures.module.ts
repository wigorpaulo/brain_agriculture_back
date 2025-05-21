import { Module } from '@nestjs/common';
import { PlantedCulturesService } from './planted_cultures.service';
import { PlantedCulturesController } from './planted_cultures.controller';
import { PlantedCulture } from './entities/planted_culture.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([PlantedCulture]), CommonModule],
  controllers: [PlantedCulturesController],
  providers: [PlantedCulturesService],
})
export class PlantedCulturesModule {}
