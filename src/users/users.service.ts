import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserValidationService } from '../common/services/user-validation.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly userValidationService: UserValidationService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.userValidationService.validateEmailUnique(createUserDto.email);

    const hashedPassword = await this.encryptPassword(createUserDto.password);

    const newUser = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.userRepo.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepo.find();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userValidationService.validate(id);

    const updateData: Partial<User> = {
      ...updateUserDto,
      updated_at: new Date(),
    };

    if (updateUserDto.password) {
      updateData.password = await this.encryptPassword(updateUserDto.password);
    }

    const updatedUser = this.userRepo.merge(user, updateData);

    return await this.userRepo.save(updatedUser);
  }

  private async encryptPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
}
