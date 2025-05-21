import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from '../../cities/entities/city.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CityValidationService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  async validate(cityId: string | number): Promise<City> {
    const numericId = Number(cityId);

    const city = await this.cityRepo.findOneBy({
      id: numericId,
    });

    if (!city) {
      this.messageNotFound(numericId);
    }

    return city;
  }

  private messageNotFound(id: number): never {
    throw new NotFoundException({
      message: `Cidade não encontrada`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste as cidades disponíveis primeiro',
      },
    });
  }

  private async isUniqueName(name: string): Promise<boolean> {
    const exist = await this.cityRepo.count({
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
          suggestion: 'Escolha outro nome para a cidade.',
        },
      });
    }
  }
}
