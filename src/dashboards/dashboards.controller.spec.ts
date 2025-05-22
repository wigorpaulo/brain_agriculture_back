import { Test, TestingModule } from '@nestjs/testing';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardChartItem, DashboardResponseDto } from './dto/dashboard-response.dto';

describe('DashboardsController', () => {
  let controller: DashboardsController;
  let service: DashboardsService;

  const mockDashboardData = {
    totalRuralProperties: 150,
    totalAreal: 12000,
    charts: {
      byState: [
        {
          label: 'São paulo',
          value: 50,
        },
      ],
      byPlantedCulture: [
        {
          label: 'Trigo',
          value: 50,
        },
      ],
      bySoilUse: [
        {
          label: 'Área Agricultável',
          value: 50,
        },
        {
          label: 'Área Vegetável',
          value: 50,
        },
      ],
    },
  } as DashboardResponseDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardsController],
      providers: [
        {
          provide: DashboardsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockDashboardData),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // desativa a guarda JWT nos testes
      .compile();

    controller = module.get<DashboardsController>(DashboardsController);
    service = module.get<DashboardsService>(DashboardsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return dashboard data from the service', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(mockDashboardData);

      const result = await controller.findAll();

      expect(result).toBe(mockDashboardData);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
