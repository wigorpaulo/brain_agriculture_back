import { Module } from '@nestjs/common';
import { RuralPropertiesService } from './rural_properties.service';
import { RuralPropertiesController } from './rural_properties.controller';
import { RuralProperty } from './entities/rural_property.entity';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([RuralProperty, User]), CommonModule],
  controllers: [RuralPropertiesController],
  providers: [RuralPropertiesService],
})
export class RuralPropertiesModule {}
