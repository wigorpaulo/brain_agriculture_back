import { Injectable } from '@nestjs/common';
import { CreateCultivationDto } from './dto/create-cultivation.dto';
import { UpdateCultivationDto } from './dto/update-cultivation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cultivation } from './entities/cultivation.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RuralProperty } from '../rural_properties/entities/rural_property.entity';
import { Harvest } from '../harvests/entities/harvest.entity';
import { PlantedCulture } from '../planted_cultures/entities/planted_culture.entity';

@Injectable()
export class CultivationsService {
  constructor(
    @InjectRepository(Cultivation)
    private cultivationRepo: Repository<Cultivation>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(RuralProperty)
    private ruralPropertyRepo: Repository<RuralProperty>,
    @InjectRepository(Harvest)
    private harvestRepo: Repository<Harvest>,
    @InjectRepository(PlantedCulture)
    private plantedCultureRepo: Repository<PlantedCulture>,
  ) {}

  async create(
    createCultivationDto: CreateCultivationDto,
    userId: string | number,
  ): Promise<Omit<Cultivation, 'created_by'>> {
    const user = await this.userRepo.findOne({
      where: { id: Number(userId) },
      select: ['id'],
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (createCultivationDto.rural_propertyId) {
      await this.isValidaRuralPropertyId(createCultivationDto.rural_propertyId);
    }

    if (createCultivationDto.harvestId) {
      await this.isValidaHarvestId(createCultivationDto.harvestId);
    }

    if (createCultivationDto.planted_cultureId) {
      await this.isValidaPlantedCultureId(
        createCultivationDto.planted_cultureId,
      );
    }

    const newCultivation = this.cultivationRepo.create({
      ...createCultivationDto,
      created_by: user,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedCultivation = await this.cultivationRepo.save(newCultivation);

    const { created_by: _created_by, ...result } = savedCultivation;
    return result;
  }

  async findAll(): Promise<Cultivation[]> {
    return await this.cultivationRepo.find();
  }

  async findOne(id: number): Promise<Cultivation | null> {
    return await this.cultivationRepo.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateCultivationDto: UpdateCultivationDto,
  ): Promise<Cultivation> {
    const cultivation = await this.cultivationRepo.findOne({ where: { id } });

    if (!cultivation) {
      throw new Error('Cultura não encontrada');
    }

    if (updateCultivationDto.rural_propertyId) {
      await this.isValidaRuralPropertyId(updateCultivationDto.rural_propertyId);
    }

    if (updateCultivationDto.harvestId) {
      await this.isValidaHarvestId(updateCultivationDto.harvestId);
    }

    if (updateCultivationDto.planted_cultureId) {
      await this.isValidaPlantedCultureId(
        updateCultivationDto.planted_cultureId,
      );
    }

    const updateData: Partial<Cultivation> = {
      ...updateCultivationDto,
      updated_at: new Date(),
    };

    const updatedCultivation = this.cultivationRepo.merge(
      cultivation,
      updateData,
    );

    return await this.cultivationRepo.save(updatedCultivation);
  }

  async remove(id: number): Promise<void> {
    const cultivation = await this.cultivationRepo.delete({ id });

    if (cultivation.affected === 0) {
      throw new Error(`Cultura com ID ${id} não encontrada`);
    }
  }

  private async isValidaRuralPropertyId(id: number): Promise<void> {
    const exist = await this.ruralPropertyRepo.count({
      where: { id },
    });

    if (exist === 0) {
      throw new Error(`Propriedade rural com ID ${id} não encontrada`);
    }
  }

  private async isValidaHarvestId(id: number): Promise<void> {
    const exist = await this.harvestRepo.count({
      where: { id },
    });

    if (exist === 0) {
      throw new Error(`Safra com ID ${id} não encontrada`);
    }
  }

  private async isValidaPlantedCultureId(id: number): Promise<void> {
    const exist = await this.plantedCultureRepo.count({
      where: { id },
    });

    if (exist === 0) {
      throw new Error(`Cultura plantada com ID ${id} não encontrada`);
    }
  }
}
