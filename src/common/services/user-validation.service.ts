import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class UserValidationService {
  private userCache = new Map<number, User>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validate(userId: string | number): Promise<User> {
    const numericId = Number(userId);

    const cachedUser = this.userCache.get(numericId);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepository.findOne({
      where: { id: numericId },
    });

    if (!user) {
      this.messageNotFound(numericId);
    }

    this.userCache.set(numericId, user);
    return user;
  }

  private messageNotFound(id: number): never {
    throw new NotFoundException({
      message: `Usuário não encontrado`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste os usuparios disponíveis primeiro',
      },
    });
  }

  private async isUniqueEmail(email: string): Promise<boolean> {
    const exist = await this.userRepository.count({
      where: { email },
    });

    return exist === 0;
  }

  async validateEmailUnique(email: string): Promise<void> {
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
}
