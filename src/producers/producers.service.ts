import { Injectable } from '@nestjs/common';
import { CreateProducerDto } from './dto/create-producer.dto';
import { UpdateProducerDto } from './dto/update-producer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Producer } from './entities/producer.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProducersService {
  constructor(
    @InjectRepository(Producer)
    private producerRepo: Repository<Producer>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(
    createProducerDto: CreateProducerDto,
    userId: string | number,
  ): Promise<Omit<Producer, 'created_by'>> {
    await this.validateCpfCnpjUnique(createProducerDto.name);

    const user = await this.userRepo.findOne({
      where: { id: Number(userId) },
      select: ['id'],
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

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
    if (updateProducerDto.name) {
      await this.validateCpfCnpjUnique(updateProducerDto.name);
    }

    const producer = await this.producerRepo.findOne({ where: { id } });

    if (!producer) {
      throw new Error('Produtor não encontrado');
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
      throw new Error(`Produtor com ID ${id} não encontrado`);
    }
  }

  private async isUniqueCpfCnpj(cpfCnpj: string): Promise<boolean> {
    const exist = await this.producerRepo.count({
      where: { cpf_cnpj: cpfCnpj },
    });

    return exist === 0;
  }

  private async validateCpfCnpjUnique(name: string): Promise<void> {
    const isUniqueCpfCnpj = await this.isUniqueCpfCnpj(name);

    if (!isUniqueCpfCnpj) {
      throw new Error('CPF ou CNPJ já cadastrado');
    }
  }
}
