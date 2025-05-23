import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RuralProperty } from '../rural_properties/entities/rural_property.entity';
import { Repository } from 'typeorm';
import { Cultivation } from '../cultivations/entities/cultivation.entity';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@Injectable()
export class DashboardsService {
  private readonly logger = new Logger(DashboardsService.name);

  constructor(
    @InjectRepository(RuralProperty)
    private readonly ruralPropertyRepo: Repository<RuralProperty>,
    @InjectRepository(Cultivation)
    private readonly cultivationRepo: Repository<Cultivation>,
  ) {}

  async findAll(): Promise<DashboardResponseDto> {
    const totalRuralProperties = await this.ruralPropertyRepo.count();

    const totalArealRaw = await this.ruralPropertyRepo
      .createQueryBuilder('rp')
      .select('SUM(rp.total_area)', 'total_area')
      .getRawOne<{ total_area: string | null }>();

    const totalAreal = totalArealRaw?.total_area
      ? Number(totalArealRaw.total_area)
      : 0;

    const ruralPropertiesByState = await this.ruralPropertyRepo
      .createQueryBuilder('rp')
      .innerJoin('rp.city', 'c')
      .innerJoin('c.state', 's')
      .select('s.name', 'state')
      .addSelect('COUNT(rp.id)', 'total_rural_properties')
      .groupBy('s.name')
      .getRawMany<{ state: string; total_rural_properties: string }>();

    const byState = ruralPropertiesByState || [];

    const ruralPropertiesByPlantedCulture = await this.cultivationRepo
      .createQueryBuilder('c')
      .innerJoin('c.planted_culture', 'pc')
      .select('pc.name', 'planted_culture')
      .addSelect('COUNT(c.id)', 'total_cultivations')
      .groupBy('pc.name')
      .getRawMany<{ planted_culture: string; total_cultivations: string }>();

    const byPlantedCulture = ruralPropertiesByPlantedCulture || [];

    const soilUseRaw = await this.ruralPropertyRepo
      .createQueryBuilder('rp')
      .select('SUM(rp.arable_area)', 'arable')
      .addSelect('SUM(rp.vegetation_area)', 'vegetation_area')
      .getRawOne<{ arable: string | null; vegetation_area: string | null }>();

    const arableArea = soilUseRaw?.arable ? Number(soilUseRaw.arable) : 0;
    const vegetationArea = soilUseRaw?.vegetation_area
      ? Number(soilUseRaw.vegetation_area)
      : 0;

    this.logger.log('Dashboard find with successfully.');
    return {
      totalRuralProperties,
      totalAreal: totalAreal,
      charts: {
        byState: byState.map((item) => ({
          label: item.state,
          value: Number(item.total_rural_properties),
        })),
        byPlantedCulture: byPlantedCulture.map((item) => ({
          label: item.planted_culture,
          value: Number(item.total_cultivations),
        })),
        bySoilUse: [
          {
            label: 'Área Agricultável',
            value: arableArea,
          },
          {
            label: 'Área Vegetável',
            value: vegetationArea,
          },
        ],
      },
    };
  }
}
