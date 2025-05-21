import { Module } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { DashboardsController } from './dashboards.controller';
import { RuralProperty } from '../rural_properties/entities/rural_property.entity';
import { State } from '../states/entities/state.entity';
import { PlantedCulture } from '../planted_cultures/entities/planted_culture.entity';
import { Cultivation } from '../cultivations/entities/cultivation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RuralProperty, Cultivation])],
  controllers: [DashboardsController],
  providers: [DashboardsService],
})
export class DashboardsModule {}
