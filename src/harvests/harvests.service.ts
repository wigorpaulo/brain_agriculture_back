import { Injectable } from '@nestjs/common';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Harvest } from './entities/harvest.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class HarvestsService {
  constructor(
    @InjectRepository(Harvest)
    private harvestRepo: Repository<Harvest>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(
    createHarvestDto: CreateHarvestDto,
    userId: string | number,
  ): Promise<Omit<Harvest, 'created_by'>> {
    await this.validateNameUnique(createHarvestDto.name);

    const user = await this.userRepo.findOne({
      where: { id: Number(userId) },
      select: ['id'],
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

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
      throw new Error('Safra não encontrada');
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
      throw new Error(`Safra com ID ${id} não encontrada`);
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
      throw new Error('Nome já cadastrado');
    }
  }
}
