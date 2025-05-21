import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UserValidationService } from './services/user-validation.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserValidationService],
  exports: [UserValidationService],
})
export class CommonModule {}
