import { Injectable, Logger } from '@nestjs/common';
import { CreateCultivationDto } from './dto/create-cultivation.dto';
import { UpdateCultivationDto } from './dto/update-cultivation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cultivation } from './entities/cultivation.entity';
import { Repository } from 'typeorm';
import { UserValidationService } from '../common/services/user-validation.service';
import { CultivationValidationService } from '../common/services/cultivation-validation.service';
import { RuralPropertyValidationService } from '../common/services/rural_property-validation.service';
import { HarvestValidationService } from '../common/services/harvest-validation.service';
import { PlantedCultureValidationService } from '../common/services/planted_culture-validation.service';
import { RuralProperty } from '../rural_properties/entities/rural_property.entity';
import { Harvest } from '../harvests/entities/harvest.entity';
import { PlantedCulture } from '../planted_cultures/entities/planted_culture.entity';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class CultivationsService {
  private readonly logger = new Logger(CultivationsService.name);

  constructor(
    @InjectRepository(Cultivation)
    private readonly cultivationRepo: Repository<Cultivation>,
    private readonly userValidationService: UserValidationService,
    private readonly cultivationValidationService: CultivationValidationService,
    private readonly ruralPropertyValidationService: RuralPropertyValidationService,
    private readonly harvestValidationService: HarvestValidationService,
    private readonly plantedCultureValidationService: PlantedCultureValidationService,
  ) {}

  async create(
    createCultivationDto: CreateCultivationDto,
    userId: string | number,
  ): Promise<Record<string, any>> {
    const user = await this.userValidationService.validate(userId);

    const ruralProperty = await this.ruralPropertyValidationService.validate(
      createCultivationDto.rural_propertyId,
    );

    const harvest = await this.harvestValidationService.validate(
      createCultivationDto.harvestId,
    );

    const plantedCulture = await this.plantedCultureValidationService.validate(
      createCultivationDto.planted_cultureId,
    );

    const newCultivation = this.cultivationRepo.create({
      ...createCultivationDto,
      rural_property: ruralProperty,
      harvest: harvest,
      planted_culture: plantedCulture,
      created_by: user,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.logger.log('Cultivation created successfully.');
    return instanceToPlain(await this.cultivationRepo.save(newCultivation));
  }

  async findAll(): Promise<Record<string, any>> {
    const cultivations = await this.cultivationRepo.find({
      relations: ['rural_property', 'harvest', 'planted_culture', 'created_by'],
    });

    return instanceToPlain(cultivations);
  }

  async findOne(id: number): Promise<Cultivation | null> {
    return await this.cultivationRepo.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateCultivationDto: UpdateCultivationDto,
  ): Promise<Cultivation> {
    const cultivation = await this.cultivationValidationService.validate(id);

    let ruralProperty: RuralProperty | undefined;
    if (updateCultivationDto.rural_propertyId) {
      ruralProperty = await this.ruralPropertyValidationService.validate(
        updateCultivationDto.rural_propertyId,
      );
    }

    let harvest: Harvest | undefined;
    if (updateCultivationDto.harvestId) {
      harvest = await this.harvestValidationService.validate(
        updateCultivationDto.harvestId,
      );
    }

    let plantedCulture: PlantedCulture | undefined;
    if (updateCultivationDto.planted_cultureId) {
      plantedCulture = await this.plantedCultureValidationService.validate(
        updateCultivationDto.planted_cultureId,
      );
    }

    const updateData: Partial<Cultivation> = {
      ...updateCultivationDto,
      updated_at: new Date(),
    };

    if (ruralProperty) {
      updateData.rural_property = ruralProperty;
    }

    if (harvest) {
      updateData.harvest = harvest;
    }

    if (plantedCulture) {
      updateData.planted_culture = plantedCulture;
    }

    const updatedCultivation = this.cultivationRepo.merge(
      cultivation,
      updateData,
    );

    this.logger.log('Cultivation updated successfully.');
    return await this.cultivationRepo.save(updatedCultivation);
  }

  async remove(id: number): Promise<void> {
    const cultivation = await this.cultivationValidationService.validate(id);

    this.logger.log('Cultivation deleted successfully.');
    await this.cultivationRepo.remove(cultivation);
  }
}
