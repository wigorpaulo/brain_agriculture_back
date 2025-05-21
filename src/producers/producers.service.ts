import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProducerDto } from './dto/create-producer.dto';
import { UpdateProducerDto } from './dto/update-producer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Producer } from './entities/producer.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserValidationService } from '../common/services/user-validation.service';

@Injectable()
export class ProducersService {
  constructor(
    @InjectRepository(Producer)
    private producerRepo: Repository<Producer>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly userValidationService: UserValidationService,
  ) {}

  async create(
    createProducerDto: CreateProducerDto,
    userId: string | number,
  ): Promise<Omit<Producer, 'created_by'>> {
    await this.validateCpfCnpjUnique(createProducerDto.cpf_cnpj);

    const user = await this.userValidationService.validateUserId(userId);

    const newProducer = this.producerRepo.create({
      ...createProducerDto,
      created_by: user,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedProducer = await this.producerRepo.save(newProducer);

    const { created_by: _created_by, ...result } = savedProducer;
    return result;
  }

  async findAll(): Promise<Producer[]> {
    return await this.producerRepo.find();
  }

  async findOne(id: number): Promise<Producer | null> {
    return await this.producerRepo.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateProducerDto: UpdateProducerDto,
  ): Promise<Producer> {
    if (updateProducerDto.cpf_cnpj) {
      await this.validateCpfCnpjUnique(updateProducerDto.cpf_cnpj);
    }

    const producer = await this.producerRepo.findOne({ where: { id } });

    if (!producer) {
      this.messageProducerNotFound(id);
    }

    const updateData: Partial<Producer> = {
      ...updateProducerDto,
      updated_at: new Date(),
    };

    const updatedProducer = this.producerRepo.merge(producer, updateData);

    return await this.producerRepo.save(updatedProducer);
  }

  async remove(id: number): Promise<void> {
    const producer = await this.producerRepo.delete({ id });

    if (producer.affected === 0) {
      this.messageProducerNotFound(id);
    }
  }

  private async isUniqueCpfCnpj(cpfCnpj: string): Promise<boolean> {
    const exist = await this.producerRepo.count({
      where: { cpf_cnpj: cpfCnpj },
    });

    return exist === 0;
  }

  private async validateCpfCnpjUnique(cpf_cnpj: string): Promise<void> {
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

  private messageProducerNotFound(id: number): never {
    throw new NotFoundException({
      message: `Produtor não encontrada`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste os produtor disponíveis primeiro',
      },
    });
  }
}
