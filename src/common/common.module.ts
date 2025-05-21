import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UserValidationService } from './services/user-validation.service';
import { Producer } from '../producers/entities/producer.entity';
import { ProducerValidationService } from './services/producer-validation.service';
import { CityValidationService } from './services/city-validation.service';
import { State } from '../states/entities/state.entity';
import { City } from '../cities/entities/city.entity';
import { StateValidationService } from './services/state-validation.service';
import { HarvestValidationService } from './services/harvest-validation.service';
import { Harvest } from '../harvests/entities/harvest.entity';
import { PlantedCulture } from '../planted_cultures/entities/planted_culture.entity';
import { PlantedCultureValidationService } from './services/planted_culture-validation.service';
import { RuralPropertyValidationService } from './services/rural_property-validation.service';
import { RuralProperty } from '../rural_properties/entities/rural_property.entity';
import { CultivationValidationService } from './services/cultivation-validation.service';
import { Cultivation } from '../cultivations/entities/cultivation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Producer,
      City,
      State,
      Harvest,
      PlantedCulture,
      RuralProperty,
      Cultivation,
    ]),
  ],
  providers: [
    UserValidationService,
    ProducerValidationService,
    StateValidationService,
    CityValidationService,
    HarvestValidationService,
    PlantedCultureValidationService,
    RuralPropertyValidationService,
    CultivationValidationService,
  ],
  exports: [
    UserValidationService,
    ProducerValidationService,
    StateValidationService,
    CityValidationService,
    HarvestValidationService,
    PlantedCultureValidationService,
    RuralPropertyValidationService,
    CultivationValidationService,
  ],
})
export class CommonModule {}
