import { Injectable, Logger } from '@nestjs/common';
import { CreateRuralPropertyDto } from './dto/create-rural_property.dto';
import { UpdateRuralPropertyDto } from './dto/update-rural_property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RuralProperty } from './entities/rural_property.entity';
import { Repository } from 'typeorm';
import { UserValidationService } from '../common/services/user-validation.service';
import { ProducerValidationService } from '../common/services/producer-validation.service';
import { RuralPropertyValidationService } from '../common/services/rural_property-validation.service';
import { CityValidationService } from '../common/services/city-validation.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class RuralPropertiesService {
  private readonly logger = new Logger(RuralPropertiesService.name);

  constructor(
    @InjectRepository(RuralProperty)
    private readonly ruralPropertyRepo: Repository<RuralProperty>,
    private readonly userValidationService: UserValidationService,
    private readonly producerValidationService: ProducerValidationService,
    private readonly ruralPropertyValidationService: RuralPropertyValidationService,
    private readonly cityValidationService: CityValidationService,
  ) {}

  async create(
    createRuralPropertyDto: CreateRuralPropertyDto,
    userId: string | number,
  ): Promise<Record<string, any>> {
    this.ruralPropertyValidationService.validateAreaTotalCanNotBeGreater(
      createRuralPropertyDto.arable_area,
      createRuralPropertyDto.vegetation_area,
      createRuralPropertyDto.total_area,
    );

    const user = await this.userValidationService.validate(userId);

    const producer = await this.producerValidationService.validate(
      createRuralPropertyDto.producerId,
    );

    const city = await this.cityValidationService.validate(
      createRuralPropertyDto.cityId,
    );

    const newRuralProperty = this.ruralPropertyRepo.create({
      ...createRuralPropertyDto,
      producer: producer,
      city: city,
      created_by: user,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.logger.log('Rural property created successfully.');
    return instanceToPlain(await this.ruralPropertyRepo.save(newRuralProperty));
  }

  async findAll(): Promise<Record<string, any>> {
    const ruralProperties = await this.ruralPropertyRepo.find({
      relations: ['producer', 'city', 'created_by'],
    });

    return instanceToPlain(ruralProperties);
  }

  async findOne(id: number): Promise<RuralProperty | null> {
    return await this.ruralPropertyRepo.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateRuralPropertyDto: UpdateRuralPropertyDto,
  ): Promise<RuralProperty> {
    const ruralProperty =
      await this.ruralPropertyValidationService.validate(id);

    const updateData: Partial<RuralProperty> = {
      ...updateRuralPropertyDto,
      updated_at: new Date(),
    };

    const updatedRuralProperty = this.ruralPropertyRepo.merge(
      ruralProperty,
      updateData,
    );

    this.ruralPropertyValidationService.validateAreaTotalCanNotBeGreater(
      updatedRuralProperty.arable_area,
      updatedRuralProperty.vegetation_area,
      updatedRuralProperty.total_area,
    );

    this.logger.log('Rural property updated successfully.');
    return await this.ruralPropertyRepo.save(updatedRuralProperty);
  }

  async remove(id: number): Promise<void> {
    const ruralProperty =
      await this.ruralPropertyValidationService.validate(id);

    this.logger.log('Rural property deleted successfully.');
    await this.ruralPropertyRepo.remove(ruralProperty);
  }
}
