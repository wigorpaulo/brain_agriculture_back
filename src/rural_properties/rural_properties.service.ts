import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRuralPropertyDto } from './dto/create-rural_property.dto';
import { UpdateRuralPropertyDto } from './dto/update-rural_property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RuralProperty } from './entities/rural_property.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserValidationService } from '../common/services/user-validation.service';

@Injectable()
export class RuralPropertiesService {
  constructor(
    @InjectRepository(RuralProperty)
    private ruralPropertyRepo: Repository<RuralProperty>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly userValidationService: UserValidationService,
  ) {}

  async create(
    createRuralPropertyDto: CreateRuralPropertyDto,
    userId: string | number,
  ): Promise<Omit<RuralProperty, 'created_by'>> {
    const sumArea =
      Number(createRuralPropertyDto.arable_area) +
      Number(createRuralPropertyDto.vegetation_area);

    if (sumArea > createRuralPropertyDto.total_area) {
      this.messageAreaTotalCanNotBeGreater();
    }

    const user = await this.userValidationService.validateUserId(userId);

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
      this.messageRuralPropertyNotFound(id);
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
      this.messageAreaTotalCanNotBeGreater();
    }

    return await this.ruralPropertyRepo.save(updatedRuralProperty);
  }

  async remove(id: number): Promise<void> {
    const ruralProperty = await this.ruralPropertyRepo.delete({ id });

    if (ruralProperty.affected === 0) {
      this.messageRuralPropertyNotFound(id);
    }
  }

  private messageRuralPropertyNotFound(id: number): never {
    throw new NotFoundException({
      message: `Propriedade rural não encontrada`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste as propriedade rural disponíveis primeiro',
      },
    });
  }

  private messageAreaTotalCanNotBeGreater(): never {
    throw new NotFoundException({
      message: `Área total não pode ser maior que a soma das áreas agricultável e vegetação`,
      details: {
        suggestion:
          'Verifique os valores das áreas agricultável e vegetação e tente novamente.',
      },
    });
  }
}
