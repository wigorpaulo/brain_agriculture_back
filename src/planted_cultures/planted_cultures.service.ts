import { Injectable, Logger } from '@nestjs/common';
import { CreatePlantedCultureDto } from './dto/create-planted_culture.dto';
import { UpdatePlantedCultureDto } from './dto/update-planted_culture.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlantedCulture } from './entities/planted_culture.entity';
import { Repository } from 'typeorm';
import { UserValidationService } from '../common/services/user-validation.service';
import { PlantedCultureValidationService } from '../common/services/planted_culture-validation.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class PlantedCulturesService {
  private readonly logger = new Logger(PlantedCulturesService.name);

  constructor(
    @InjectRepository(PlantedCulture)
    private readonly plantedCultureRepo: Repository<PlantedCulture>,
    private readonly userValidationService: UserValidationService,
    private readonly plantedCultureValidationService: PlantedCultureValidationService,
  ) {}

  async create(
    createPlantedCultureDto: CreatePlantedCultureDto,
    userId: string | number,
  ): Promise<Record<string, any>> {
    await this.plantedCultureValidationService.validateNameUnique(
      createPlantedCultureDto.name,
    );

    const user = await this.userValidationService.validate(userId);

    const newPlantedCulture = this.plantedCultureRepo.create({
      ...createPlantedCultureDto,
      created_by: user,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.logger.log('PLanted culture created successfully.');
    return instanceToPlain(
      await this.plantedCultureRepo.save(newPlantedCulture),
    );
  }

  async findAll(): Promise<Record<string, any>> {
    const plantedCultures = await this.plantedCultureRepo.find({
      relations: ['created_by'],
    });

    return instanceToPlain(plantedCultures);
  }

  async findOne(id: number): Promise<PlantedCulture | null> {
    return await this.plantedCultureRepo.findOne({ where: { id } });
  }

  async update(
    id: number,
    updatePlantedCultureDto: UpdatePlantedCultureDto,
  ): Promise<PlantedCulture> {
    if (updatePlantedCultureDto.name) {
      await this.plantedCultureValidationService.validateNameUnique(
        updatePlantedCultureDto.name,
      );
    }

    const plantedCulture =
      await this.plantedCultureValidationService.validate(id);

    const updateData: Partial<PlantedCulture> = {
      ...updatePlantedCultureDto,
      updated_at: new Date(),
    };

    const updatedPlantedCulture = this.plantedCultureRepo.merge(
      plantedCulture,
      updateData,
    );

    this.logger.log('PLanted culture updated successfully.');
    return await this.plantedCultureRepo.save(updatedPlantedCulture);
  }

  async remove(id: number): Promise<void> {
    const plantedCulture =
      await this.plantedCultureValidationService.validate(id);

    this.logger.log('PLanted culture deleted successfully.');
    await this.plantedCultureRepo.remove(plantedCulture);
  }
}
