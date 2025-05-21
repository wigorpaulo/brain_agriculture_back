import { Injectable } from '@nestjs/common';
import { CreateRuralPropertyDto } from './dto/create-rural_property.dto';
import { UpdateRuralPropertyDto } from './dto/update-rural_property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RuralProperty } from './entities/rural_property.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RuralPropertiesService {
  constructor(
    @InjectRepository(RuralProperty)
    private ruralPropertyRepo: Repository<RuralProperty>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(
    createRuralPropertyDto: CreateRuralPropertyDto,
    userId: string | number,
  ): Promise<Omit<RuralProperty, 'created_by'>> {
    const sumArea =
      Number(createRuralPropertyDto.arable_area) +
      Number(createRuralPropertyDto.vegetation_area);

    if (sumArea > createRuralPropertyDto.total_area) {
      throw new Error(
        'Área total não pode ser maior que a soma das áreas agricultável e vegetação',
      );
    }

    const user = await this.userRepo.findOne({
      where: { id: Number(userId) },
      select: ['id'],
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const newRuralProperty = this.ruralPropertyRepo.create({
      ...createRuralPropertyDto,
      created_by: user,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const savedRuralProperty =
      await this.ruralPropertyRepo.save(newRuralProperty);

    const { created_by: _created_by, ...result } = savedRuralProperty;
    return result;
  }

  async findAll(): Promise<RuralProperty[]> {
    return await this.ruralPropertyRepo.find();
  }

  async findOne(id: number): Promise<RuralProperty | null> {
    return await this.ruralPropertyRepo.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateRuralPropertyDto: UpdateRuralPropertyDto,
  ): Promise<RuralProperty> {
    const ruralProperty = await this.ruralPropertyRepo.findOne({
      where: { id },
    });

    if (!ruralProperty) {
      throw new Error('Propriedade rural não encontrada');
    }

    const updateData: Partial<RuralProperty> = {
      ...updateRuralPropertyDto,
      updated_at: new Date(),
    };

    const updatedRuralProperty = this.ruralPropertyRepo.merge(
      ruralProperty,
      updateData,
    );

    const sumArea =
      Number(updatedRuralProperty.arable_area) +
      Number(updatedRuralProperty.vegetation_area);

    if (sumArea > updatedRuralProperty.total_area) {
      throw new Error(
        'Área total não pode ser maior que a soma das áreas agricultável e vegetação',
      );
    }

    return await this.ruralPropertyRepo.save(updatedRuralProperty);
  }

  async remove(id: number): Promise<void> {
    const ruralProperty = await this.ruralPropertyRepo.delete({ id });

    if (ruralProperty.affected === 0) {
      throw new Error(`Propriedade rural com ID ${id} não encontrada`);
    }
  }
}
