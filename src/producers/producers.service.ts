import { Injectable } from '@nestjs/common';
import { CreateProducerDto } from './dto/create-producer.dto';
import { UpdateProducerDto } from './dto/update-producer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Producer } from './entities/producer.entity';
import { Repository } from 'typeorm';
import { UserValidationService } from '../common/services/user-validation.service';
import { ProducerValidationService } from '../common/services/producer-validation.service';
import { City } from '../cities/entities/city.entity';
import { CityValidationService } from '../common/services/city-validation.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ProducersService {
  constructor(
    @InjectRepository(Producer)
    private producerRepo: Repository<Producer>,
    private readonly userValidationService: UserValidationService,
    private readonly producerValidationService: ProducerValidationService,
    private readonly cityValidationService: CityValidationService,
  ) {}

  async create(
    createProducerDto: CreateProducerDto,
    userId: string | number,
  ): Promise<Record<string, any>> {
    await this.producerValidationService.validateCpfCnpjUnique(
      createProducerDto.cpf_cnpj,
    );

    const user = await this.userValidationService.validate(userId);

    const city = await this.cityValidationService.validate(
      createProducerDto.city_id,
    );

    const newProducer = this.producerRepo.create({
      ...createProducerDto,
      city: city,
      created_by: user,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return instanceToPlain(await this.producerRepo.save(newProducer));
  }

  async findAll(): Promise<Record<string, any>> {
    const producers = await this.producerRepo.find({
      relations: ['city', 'created_by'],
    });

    return instanceToPlain(producers);
  }

  async findOne(id: number): Promise<Producer | null> {
    return await this.producerRepo.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateProducerDto: UpdateProducerDto,
  ): Promise<Producer> {
    if (updateProducerDto.cpf_cnpj) {
      await this.producerValidationService.validateCpfCnpjUnique(
        updateProducerDto.cpf_cnpj,
      );
    }

    let city: City | undefined;
    if (updateProducerDto.city_id) {
      city = await this.cityValidationService.validate(
        updateProducerDto.city_id,
      );
    }

    const producer = await this.producerValidationService.validate(id);

    const updateData: Partial<Producer> = {
      ...updateProducerDto,
      updated_at: new Date(),
    };

    if (city) {
      updateData.city = city;
    }

    const updatedProducer = this.producerRepo.merge(producer, updateData);

    return await this.producerRepo.save(updatedProducer);
  }

  async remove(id: number): Promise<void> {
    const producer = await this.producerValidationService.validate(id);

    await this.producerRepo.remove(producer);
  }
}
