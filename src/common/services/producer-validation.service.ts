import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Producer } from '../../producers/entities/producer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProducerValidationService {
  constructor(
    @InjectRepository(Producer)
    private readonly producerRepo: Repository<Producer>,
  ) {}

  async validate(producerId: string | number): Promise<Producer> {
    const numericId = Number(producerId);

    const producer = await this.producerRepo.findOneBy({
      id: numericId,
    });

    if (!producer) {
      this.messageNotFound(numericId);
    }

    return producer;
  }

  private messageNotFound(id: number): never {
    throw new NotFoundException({
      message: `Produtor não encontrada`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste os produtor disponíveis primeiro',
      },
    });
  }

  private async isUniqueCpfCnpj(cpfCnpj: string): Promise<boolean> {
    const exist = await this.producerRepo.count({
      where: { cpf_cnpj: cpfCnpj },
    });

    return exist === 0;
  }

  async validateCpfCnpjUnique(cpf_cnpj: string): Promise<void> {
    const isUniqueCpfCnpj = await this.isUniqueCpfCnpj(cpf_cnpj);

    if (!isUniqueCpfCnpj) {
      throw new BadRequestException({
        message: `CPF ou CNPJ já cadastrado`,
        details: {
          cpf_cnpj,
          suggestion: 'Escolha outro CPF ou CNPJ para o produtor.',
        },
      });
    }
  }
}
