import { Test } from '@nestjs/testing';
import { DashboardsService } from './dashboards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RuralProperty } from '../rural_properties/entities/rural_property.entity';
import { Cultivation } from '../cultivations/entities/cultivation.entity';

describe('DashboardsService', () => {
  let service: DashboardsService;
  let ruralPropertyRepo: any;
  let cultivationRepo: any;

  const mockTotalRuralProperties = 150;
  const mockTotalArealRaw = { total_area: 0 };
  const mockRuralPropertiesByState = [
    { state: 'SP', total_rural_properties: '50' },
    { state: 'MG', total_rural_properties: '30' },
  ];
  const mockRuralPropertiesByPlantedCulture = [
    { planted_culture: 'Soja', total_cultivations: '70' },
    { planted_culture: 'Milho', total_cultivations: '80' },
  ];
  const mockSoilUseRaw = {
    arable: '0',
    vegetation_area: '0',
  };

  // Função auxiliar para mockar queryBuilder
  const mockCreateQueryBuilder = () => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  });

  beforeEach(async () => {
    // ✅ Inicialização correta dos repositórios
    ruralPropertyRepo = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => mockCreateQueryBuilder()),
    };

    // ✅ Agora cultivationRepo é inicializado corretamente
    cultivationRepo = {
      createQueryBuilder: jest.fn(() => mockCreateQueryBuilder()),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DashboardsService,
        {
          provide: getRepositoryToken(RuralProperty),
          useValue: ruralPropertyRepo,
        },
        {
          provide: getRepositoryToken(Cultivation),
          useValue: cultivationRepo,
        },
      ],
    }).compile();

    service = moduleRef.get<DashboardsService>(DashboardsService);
  });

  it('should return dashboard data correctly formatted', async () => {
    ruralPropertyRepo.count.mockResolvedValue(mockTotalRuralProperties);

    const qb = ruralPropertyRepo.createQueryBuilder();
    qb.getRawOne.mockResolvedValueOnce(mockTotalArealRaw);
    qb.getRawMany.mockResolvedValueOnce(mockRuralPropertiesByState);
    qb.getRawOne.mockResolvedValueOnce(mockSoilUseRaw);

    const cultivationQb = cultivationRepo.createQueryBuilder();
    cultivationQb.getRawMany.mockResolvedValue(mockRuralPropertiesByPlantedCulture);

    const result = await service.findAll();

    expect(result).toEqual({
      totalRuralProperties: mockTotalRuralProperties,
      totalAreal: Number(mockTotalArealRaw.total_area),
      charts: {
        byState: [],
        byPlantedCulture: [],
        bySoilUse: [
          {
            label: 'Área Agricultável',
            value: Number(mockSoilUseRaw.arable),
          },
          {
            label: 'Área Vegetável',
            value: Number(mockSoilUseRaw.vegetation_area),
          },
        ],
      },
    });

    expect(ruralPropertyRepo.count).toHaveBeenCalled();
  });
});
