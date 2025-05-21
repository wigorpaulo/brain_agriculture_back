import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Harvest } from './entities/harvest.entity';
import { User } from '../users/entities/user.entity';
import { UserValidationService } from '../common/services/user-validation.service';

@Injectable()
export class HarvestsService {
  constructor(
    @InjectRepository(Harvest)
    private harvestRepo: Repository<Harvest>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly userValidationService: UserValidationService,
  ) {}

  async create(
    createHarvestDto: CreateHarvestDto,
    userId: string | number,
  ): Promise<Omit<Harvest, 'created_by'>> {
    await this.validateNameUnique(createHarvestDto.name);

    const user = await this.userValidationService.validateUserId(userId);

    const newHarvest = this.harvestRepo.create({
      ...createHarvestDto,
      created_by: user,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedHarvest = await this.harvestRepo.save(newHarvest);

    const { created_by: _created_by, ...result } = savedHarvest;
    return result;
  }

  async findAll(): Promise<Harvest[]> {
    return await this.harvestRepo.find();
  }

  async findOne(id: number): Promise<Harvest | null> {
    return await this.harvestRepo.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateHarvestDto: UpdateHarvestDto,
  ): Promise<Harvest> {
    if (updateHarvestDto.name) {
      await this.validateNameUnique(updateHarvestDto.name);
    }

    const harvest = await this.harvestRepo.findOne({ where: { id } });

    if (!harvest) {
      this.messageHarvestNotFound(id);
    }

    const updateData: Partial<Harvest> = {
      ...updateHarvestDto,
      updated_at: new Date(),
    };

    const updatedHarvest = this.harvestRepo.merge(harvest, updateData);

    return await this.harvestRepo.save(updatedHarvest);
  }

  async remove(id: number): Promise<void> {
    const harvest = await this.harvestRepo.delete({ id });

    if (harvest.affected === 0) {
      this.messageHarvestNotFound(id);
    }
  }

  private async isUniqueName(name: string): Promise<boolean> {
    const exist = await this.harvestRepo.count({
      where: { name },
    });

    return exist === 0;
  }

  private async validateNameUnique(name: string): Promise<void> {
    const isUniqueName = await this.isUniqueName(name);

    if (!isUniqueName) {
      throw new BadRequestException({
        message: `Nome já cadastrado`,
        details: {
          name,
          suggestion: 'Escolha outro nome para a safra.',
        },
      });
    }
  }

  private messageHarvestNotFound(id: number): never {
    throw new NotFoundException({
      message: `Safra não encontrada`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste as safras disponíveis primeiro',
      },
    });
  }
}
