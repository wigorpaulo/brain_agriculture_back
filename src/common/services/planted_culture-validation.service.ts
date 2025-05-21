import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlantedCulture } from '../../planted_cultures/entities/planted_culture.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlantedCultureValidationService {
  constructor(
    @InjectRepository(PlantedCulture)
    private readonly plantedCultureRepo: Repository<PlantedCulture>,
  ) {}

  async validate(plantedCultureId: string | number): Promise<PlantedCulture> {
    const numericId = Number(plantedCultureId);

    const plantedCulture = await this.plantedCultureRepo.findOneBy({
      id: numericId,
    });

    if (!plantedCulture) {
      this.messageNotFound(numericId);
    }

    return plantedCulture;
  }

  private messageNotFound(id: number): never {
    throw new NotFoundException({
      message: `Cultura plantada não encontrada`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste as cultura plantada disponíveis primeiro',
      },
    });
  }

  private async isUniqueName(name: string): Promise<boolean> {
    const exist = await this.plantedCultureRepo.count({
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
          suggestion: 'Escolha outro nome para a cultura plantada.',
        },
      });
    }
  }
}
