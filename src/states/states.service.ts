import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { State } from './entities/state.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatesService {
  constructor(
    @InjectRepository(State)
    private stateRepo: Repository<State>,
  ) {}

  async create(createStateDto: CreateStateDto): Promise<State> {
    await this.validateNameUnique(createStateDto.name);
    const newState = this.stateRepo.create({
      ...createStateDto,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.stateRepo.save(newState);
  }

  async findAll(): Promise<State[]> {
    return await this.stateRepo.find();
  }

  async findOne(id: number): Promise<State | null> {
    return await this.stateRepo.findOne({ where: { id } });
  }

  async update(id: number, updateStateDto: UpdateStateDto): Promise<State> {
    if (updateStateDto.name) {
      await this.validateNameUnique(updateStateDto.name);
    }

    const state = await this.stateRepo.findOne({ where: { id } });

    if (!state) {
      this.messageStateNotFound(id);
    }

    const updateData: Partial<State> = {
      ...updateStateDto,
      updated_at: new Date(),
    };

    const updatedState = this.stateRepo.merge(state, updateData);

    return await this.stateRepo.save(updatedState);
  }

  async remove(id: number): Promise<void> {
    const state = await this.stateRepo.delete({ id });

    if (state.affected === 0) {
      this.messageStateNotFound(id);
    }
  }

  private async isUniqueName(name: string): Promise<boolean> {
    const exist = await this.stateRepo.count({
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
          suggestion: 'Escolha outro nome para o estado.',
        },
      });
    }
  }

  private messageStateNotFound(id: number): never {
    throw new NotFoundException({
      message: `Estado não encontrada`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste os estado disponíveis primeiro',
      },
    });
  }
}
