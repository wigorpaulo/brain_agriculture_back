import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class UserValidationService {
  private userCache = new Map<number, { id: number }>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async validateUserId(userId: string | number): Promise<{ id: number }> {
    const numericId = Number(userId);

    const cachedUser = this.userCache.get(numericId);
    if (cachedUser) {
      return cachedUser;
    }

    if (isNaN(numericId)) {
      throw new NotFoundException({
        message: `ID de usuário inválido`,
        details: {
          userId,
          suggestion:
            'Verifique se o ID está correto ou liste os usuários disponíveis primeiro',
        },
      });
    }

    const user = await this.userRepository.findOne({
      where: { id: numericId },
      select: ['id'],
    });

    if (!user) {
      throw new NotFoundException({
        message: `Usuário não encontrada`,
        details: {
          userId,
          suggestion:
            'Verifique se o ID está correto ou liste os usuários disponíveis primeiro',
        },
      });
    }

    this.userCache.set(numericId, user);
    return user;
  }
}
