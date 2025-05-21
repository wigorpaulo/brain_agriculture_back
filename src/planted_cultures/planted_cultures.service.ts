import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlantedCultureDto } from './dto/create-planted_culture.dto';
import { UpdatePlantedCultureDto } from './dto/update-planted_culture.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlantedCulture } from './entities/planted_culture.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserValidationService } from '../common/services/user-validation.service';

@Injectable()
export class PlantedCulturesService {
  constructor(
    @InjectRepository(PlantedCulture)
    private plantedCultureRepo: Repository<PlantedCulture>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly userValidationService: UserValidationService,
  ) {}

  async create(
    createPlantedCultureDto: CreatePlantedCultureDto,
    userId: string | number,
  ): Promise<Omit<PlantedCulture, 'created_by'>> {
    await this.validateNameUnique(createPlantedCultureDto.name);

    const user = await this.userValidationService.validateUserId(userId);

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
      this.messagePlantedCultureNotFound(id);
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
      this.messagePlantedCultureNotFound(id);
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
      throw new BadRequestException({
        message: `Nome já cadastrado`,
        details: {
          name,
          suggestion: 'Escolha outro nome para a cultura plantada.',
        },
      });
    }
  }

  private messagePlantedCultureNotFound(id: number): never {
    throw new NotFoundException({
      message: `Cultura plantada não encontrada`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste as cultura plantada disponíveis primeiro',
      },
    });
  }
}
