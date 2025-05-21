import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RuralProperty } from '../../rural_properties/entities/rural_property.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RuralPropertyValidationService {
  constructor(
    @InjectRepository(RuralProperty)
    private readonly ruralPropertyRepo: Repository<RuralProperty>,
  ) {}

  async validate(ruralPropertyId: string | number): Promise<RuralProperty> {
    const numericId = Number(ruralPropertyId);

    const ruralProperty = await this.ruralPropertyRepo.findOneBy({
      id: numericId,
    });

    if (!ruralProperty) {
      this.messageNotFound(numericId);
    }

    return ruralProperty;
  }

  private messageNotFound(id: number): never {
    throw new NotFoundException({
      message: `Propriedade rural não encontrada`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste as propriedade rural disponíveis primeiro',
      },
    });
  }

  validateAreaTotalCanNotBeGreater(
    arable_area: string | number,
    vegetation_area: string | number,
    total_area: string | number,
  ): void {
    const sumArea = Number(arable_area) + Number(vegetation_area);

    if (sumArea > Number(total_area)) {
      this.messageAreaTotalCanNotBeGreater();
    }
  }

  private messageAreaTotalCanNotBeGreater(): never {
    throw new NotFoundException({
      message: `Área total não pode ser maior que a soma das áreas agricultável e vegetação`,
      details: {
        suggestion:
          'Verifique os valores das áreas agricultável e vegetação e tente novamente.',
      },
    });
  }
}
