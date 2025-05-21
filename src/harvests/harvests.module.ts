import { Module } from '@nestjs/common';
import { HarvestsService } from './harvests.service';
import { HarvestsController } from './harvests.controller';
import { Harvest } from './entities/harvest.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Harvest, User]), CommonModule],
  controllers: [HarvestsController],
  providers: [HarvestsService],
})
export class HarvestsModule {}
