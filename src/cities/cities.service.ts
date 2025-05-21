import { Injectable } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { Repository } from 'typeorm';
import { CityValidationService } from '../common/services/city-validation.service';
import { StateValidationService } from '../common/services/state-validation.service';
import { State } from '../states/entities/state.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
    private readonly cityValidationService: CityValidationService,
    private readonly stateValidationService: StateValidationService,
  ) {}

  async create(createCityDto: CreateCityDto): Promise<City> {
    await this.cityValidationService.validateNameUnique(createCityDto.name);

    const state = await this.stateValidationService.validate(
      createCityDto.state_id,
    );

    const newCity = this.cityRepo.create({
      ...createCityDto,
      state: state,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.cityRepo.save(newCity);
  }

  async findAll(): Promise<City[]> {
    return await this.cityRepo.find({
      relations: ['state'],
    });
  }

  async findOne(id: number): Promise<City | null> {
    return await this.cityRepo.findOne({ where: { id } });
  }

  async update(id: number, updateCityDto: UpdateCityDto): Promise<City> {
    if (updateCityDto.name) {
      await this.cityValidationService.validateNameUnique(updateCityDto.name);
    }

    let state: State | undefined;
    if (updateCityDto.state_id) {
      state = await this.stateValidationService.validate(
        updateCityDto.state_id,
      );
    }

    const city = await this.cityValidationService.validate(id);

    const updateData: Partial<City> = {
      ...updateCityDto,
      updated_at: new Date(),
    };

    if (state) {
      updateData.state = state;
    }

    const updatedCity = this.cityRepo.merge(city, updateData);

    return await this.cityRepo.save(updatedCity);
  }

  async remove(id: number): Promise<void> {
    const city = await this.cityValidationService.validate(id);

    await this.cityRepo.remove(city);
  }
}
