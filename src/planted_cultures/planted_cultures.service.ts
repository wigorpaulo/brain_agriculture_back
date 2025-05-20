import { Injectable } from '@nestjs/common';
import { CreatePlantedCultureDto } from './dto/create-planted_culture.dto';
import { UpdatePlantedCultureDto } from './dto/update-planted_culture.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlantedCulture } from './entities/planted_culture.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PlantedCulturesService {
  constructor(
    @InjectRepository(PlantedCulture)
    private plantedCultureRepo: Repository<PlantedCulture>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(
    createPlantedCultureDto: CreatePlantedCultureDto,
    userId: string | number,
  ): Promise<Omit<PlantedCulture, 'created_by'>> {
    await this.validateNameUnique(createPlantedCultureDto.name);

    const user = await this.userRepo.findOne({
      where: { id: Number(userId) },
      select: ['id'],
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const newPlantedCulture = this.plantedCultureRepo.create({
      ...createPlantedCultureDto,
      created_by: user,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedPlantedCulture =
      await this.plantedCultureRepo.save(newPlantedCulture);

    const { created_by: _created_by, ...result } = savedPlantedCulture;
    return result;
  }

  async findAll(): Promise<PlantedCulture[]> {
    return await this.plantedCultureRepo.find();
  }

  async findOne(id: number): Promise<PlantedCulture | null> {
    return await this.plantedCultureRepo.findOne({ where: { id } });
  }

  async update(
    id: number,
    updatePlantedCultureDto: UpdatePlantedCultureDto,
  ): Promise<PlantedCulture> {
    if (updatePlantedCultureDto.name) {
      await this.validateNameUnique(updatePlantedCultureDto.name);
    }

    const plantedCulture = await this.plantedCultureRepo.findOne({
      where: { id },
    });

    if (!plantedCulture) {
      throw new Error('Cultura plantada não encontrada');
    }

    const updateData: Partial<PlantedCulture> = {
      ...updatePlantedCultureDto,
      updated_at: new Date(),
    };

    const updatedPlantedCulture = this.plantedCultureRepo.merge(
      plantedCulture,
      updateData,
    );

    return await this.plantedCultureRepo.save(updatedPlantedCulture);
  }

  async remove(id: number): Promise<void> {
    const plantedCulture = await this.plantedCultureRepo.delete({ id });

    if (plantedCulture.affected === 0) {
      throw new Error(`Cultura plantada com ID ${id} não encontrada`);
    }
  }

  private async isUniqueName(name: string): Promise<boolean> {
    const exist = await this.plantedCultureRepo.count({
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
