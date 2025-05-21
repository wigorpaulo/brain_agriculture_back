import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private cityRepo: Repository<City>,
  ) {}

  async create(createCityDto: CreateCityDto): Promise<City> {
    await this.validateNameUnique(createCityDto.name);
    const newCity = this.cityRepo.create({
      ...createCityDto,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.cityRepo.save(newCity);
  }

  async findAll(): Promise<City[]> {
    return await this.cityRepo.find();
  }

  async findOne(id: number): Promise<City | null> {
    return await this.cityRepo.findOne({ where: { id } });
  }

  async update(id: number, updateCityDto: UpdateCityDto): Promise<City> {
    if (updateCityDto.name) {
      await this.validateNameUnique(updateCityDto.name);
    }

    const city = await this.cityRepo.findOne({ where: { id } });

    if (!city) {
      this.messageCityNotFound(id);
    }

    const updateData: Partial<City> = {
      ...updateCityDto,
      updated_at: new Date(),
    };

    const updatedCity = this.cityRepo.merge(city, updateData);

    return await this.cityRepo.save(updatedCity);
  }

  async remove(id: number): Promise<void> {
    const city = await this.cityRepo.delete({ id });

    if (city.affected === 0) {
      this.messageCityNotFound(id);
    }
  }

  private async isUniqueName(name: string): Promise<boolean> {
    const exist = await this.cityRepo.count({
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
          suggestion: 'Escolha outro nome para a cidade.',
        },
      });
    }
  }

  private messageCityNotFound(id: number): never {
    throw new NotFoundException({
      message: `Cidade não encontrada`,
      details: {
        id,
        suggestion:
          'Verifique se o ID está correto ou liste as cidades disponíveis primeiro',
      },
    });
  }
}
