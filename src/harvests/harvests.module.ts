import { Module } from '@nestjs/common';
import { HarvestsService } from './harvests.service';
import { HarvestsController } from './harvests.controller';
import { Harvest } from './entities/harvest.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Harvest, User])],
  controllers: [HarvestsController],
  providers: [HarvestsService],
})
export class HarvestsModule {}
