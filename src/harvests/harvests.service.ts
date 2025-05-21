import { Injectable } from '@nestjs/common';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Harvest } from './entities/harvest.entity';
import { UserValidationService } from '../common/services/user-validation.service';
import { HarvestValidationService } from '../common/services/harvest-validation.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class HarvestsService {
  constructor(
    @InjectRepository(Harvest)
    private readonly harvestRepo: Repository<Harvest>,
    private readonly userValidationService: UserValidationService,
    private readonly harvestValidationService: HarvestValidationService,
  ) {}

  async create(
    createHarvestDto: CreateHarvestDto,
    userId: string | number,
  ): Promise<Omit<Harvest, 'created_by'>> {
    await this.harvestValidationService.validateNameUnique(
      createHarvestDto.name,
    );

    const user = await this.userValidationService.validate(userId);

    const newHarvest = this.harvestRepo.create({
      ...createHarvestDto,
      created_by: user,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.harvestRepo.save(newHarvest);
  }

  async findAll(): Promise<Record<string, any>> {
    const harvests = await this.harvestRepo.find({
      relations: ['created_by'],
    });

    return instanceToPlain(harvests);
  }

  async findOne(id: number): Promise<Harvest | null> {
    return await this.harvestRepo.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateHarvestDto: UpdateHarvestDto,
  ): Promise<Harvest> {
    if (updateHarvestDto.name) {
      await this.harvestValidationService.validateNameUnique(
        updateHarvestDto.name,
      );
    }

    const harvest = await this.harvestValidationService.validate(id);

    const updateData: Partial<Harvest> = {
      ...updateHarvestDto,
      updated_at: new Date(),
    };

    const updatedHarvest = this.harvestRepo.merge(harvest, updateData);

    return await this.harvestRepo.save(updatedHarvest);
  }

  async remove(id: number): Promise<void> {
    const harvest = await this.harvestValidationService.validate(id);

    await this.harvestRepo.remove(harvest);
  }
}
