import { Injectable, Logger } from '@nestjs/common';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { State } from './entities/state.entity';
import { Repository } from 'typeorm';
import { StateValidationService } from '../common/services/state-validation.service';

@Injectable()
export class StatesService {
  private readonly logger = new Logger(StatesService.name);

  constructor(
    @InjectRepository(State)
    private readonly stateRepo: Repository<State>,
    private readonly stateValidationService: StateValidationService,
  ) {}

  async create(createStateDto: CreateStateDto): Promise<State> {
    await this.stateValidationService.validateNameUnique(createStateDto.name);
    const newState = this.stateRepo.create({
      ...createStateDto,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.logger.log('State created successfully.');
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
      await this.stateValidationService.validateNameUnique(updateStateDto.name);
    }

    const state = await this.stateValidationService.validate(id);

    const updateData: Partial<State> = {
      ...updateStateDto,
      updated_at: new Date(),
    };

    const updatedState = this.stateRepo.merge(state, updateData);

    this.logger.log('State updated successfully.');
    return await this.stateRepo.save(updatedState);
  }

  async remove(id: number): Promise<void> {
    const state = await this.stateValidationService.validate(id);

    this.logger.log('State deleted successfully.');
    await this.stateRepo.remove(state);
  }
}
