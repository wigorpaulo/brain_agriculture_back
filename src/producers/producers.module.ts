import { Module } from '@nestjs/common';
import { ProducersService } from './producers.service';
import { ProducersController } from './producers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producer } from './entities/producer.entity';
import { User } from '../users/entities/user.entity';
import { CommonModule } from '../common/common.module';
import { IsCpfOrCnpj } from '../common/validators/is-cpf-or-cnpj.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Producer, User]), CommonModule],
  controllers: [ProducersController],
  providers: [ProducersService, IsCpfOrCnpj],
})
export class ProducersModule {}
