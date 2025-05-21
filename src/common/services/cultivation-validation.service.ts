import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cultivation } from '../../cultivations/entities/cultivation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CultivationValidationService {
  constructor(
    @InjectRepository(Cultivation)
    private readonly cultivationRepo: Repository<Cultivation>,
  ) {}

  async validate(cultivationId: string | number): Promise<Cultivation> {
    const numericId = Number(cultivationId);

    const cultivation = await this.cultivationRepo.findOneBy({
      id: numericId,
    });

    if (!cultivation) {
      this.messageNotFound(numericId);
    }

    return cultivation;
  }

  private messageNotFound(id: number): never {
    throw new NotFoundException({
      message: `Cultivos não encontrada`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste os cultivos disponíveis primeiro',
      },
    });
  }
}
