import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { State } from '../../states/entities/state.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StateValidationService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepo: Repository<State>,
  ) {}

  async validate(stateId: string | number): Promise<State> {
    const numericId = Number(stateId);

    const state = await this.stateRepo.findOneBy({
      id: numericId,
    });

    if (!state) {
      this.messageNotFound(numericId);
    }

    return state;
  }

  private messageNotFound(id: number): never {
    throw new NotFoundException({
      message: `Estado não encontrado`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste os estado disponíveis primeiro',
      },
    });
  }

  private async isUniqueName(name: string): Promise<boolean> {
    const exist = await this.stateRepo.count({
      where: { name },
    });

    return exist === 0;
  }

  async validateNameUnique(name: string): Promise<void> {
    const isUniqueName = await this.isUniqueName(name);

    if (!isUniqueName) {
      throw new BadRequestException({
        message: `Nome já cadastrado`,
        details: {
          name,
          suggestion: 'Escolha outro nome para o estado.',
        },
      });
    }
  }
}
