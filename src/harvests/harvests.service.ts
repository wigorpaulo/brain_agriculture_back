import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Harvest } from './entities/harvest.entity';
import { Request } from 'express';
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
    @Req() req: Request,
  ): Promise<Harvest> {
    if (!req.user || typeof req.user !== 'object' || !('sub' in req.user)) {
      throw new UnauthorizedException('Usuário não autenticado corretamente');
    }

    await this.validateNameUnique(createHarvestDto.name);

    const userId = Number(req.user.sub);
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const newHarvest = this.harvestRepo.create({
      ...createHarvestDto,
      created_by: user,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.harvestRepo.save(newHarvest);
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
