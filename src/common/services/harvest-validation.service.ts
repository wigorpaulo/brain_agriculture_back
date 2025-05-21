import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Harvest } from '../../harvests/entities/harvest.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HarvestValidationService {
  constructor(
    @InjectRepository(Harvest)
    private readonly harvestRepo: Repository<Harvest>,
  ) {}

  async validate(harvestId: string | number): Promise<Harvest> {
    const numericId = Number(harvestId);

    const harvest = await this.harvestRepo.findOneBy({
      id: numericId,
    });

    if (!harvest) {
      this.messageNotFound(numericId);
    }

    return harvest;
  }

  private messageNotFound(id: number): never {
    throw new NotFoundException({
      message: `Safra não encontrada`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste as safras disponíveis primeiro',
      },
    });
  }

  private async isUniqueName(name: string): Promise<boolean> {
    const exist = await this.harvestRepo.count({
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
          suggestion: 'Escolha outro nome para a safra.',
        },
      });
    }
  }
}
