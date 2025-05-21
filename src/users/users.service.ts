import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.validateEmailUnique(createUserDto.email);

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
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      this.messageUserNotFound(id);
    }

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

  private async isUniqueEmail(email: string): Promise<boolean> {
    const exist = await this.userRepo.count({
      where: { email },
    });

    return exist === 0;
  }

  private async validateEmailUnique(email: string): Promise<void> {
    const isUniqueEmail = await this.isUniqueEmail(email);

    if (!isUniqueEmail) {
      throw new BadRequestException({
        message: `E-mail já cadastrado`,
        details: {
          email,
          suggestion: 'Escolha outro e-mail.',
        },
      });
    }
  }

  private async encryptPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  private messageUserNotFound(id: number): never {
    throw new NotFoundException({
      message: `Usuário não encontrada`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste os usuparios disponíveis primeiro',
      },
    });
  }
}
