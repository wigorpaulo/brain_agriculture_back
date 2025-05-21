import { Module } from '@nestjs/common';
import { RuralPropertiesService } from './rural_properties.service';
import { RuralPropertiesController } from './rural_properties.controller';
import { RuralProperty } from './entities/rural_property.entity';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RuralProperty, User])],
  controllers: [RuralPropertiesController],
  providers: [RuralPropertiesService],
})
export class RuralPropertiesModule {}
