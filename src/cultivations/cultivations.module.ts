import { Module } from '@nestjs/common';
import { CultivationsService } from './cultivations.service';
import { CultivationsController } from './cultivations.controller';
import { Cultivation } from './entities/cultivation.entity';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuralProperty } from '../rural_properties/entities/rural_property.entity';
import { Harvest } from '../harvests/entities/harvest.entity';
import { PlantedCulture } from '../planted_cultures/entities/planted_culture.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cultivation,
      User,
      RuralProperty,
      Harvest,
      PlantedCulture,
    ]),
    CommonModule,
  ],
  controllers: [CultivationsController],
  providers: [CultivationsService],
})
export class CultivationsModule {}
