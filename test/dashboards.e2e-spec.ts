import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestModule } from './test.module';
import { DataSource } from 'typeorm';
import { clearDatabase } from './test-utils/truncate-helper';
import { setupAuthUser, authHeader } from './test-utils/auth-helper';
import { Cultivation } from '../src/cultivations/entities/cultivation.entity';
import { Harvest } from '../src/harvests/entities/harvest.entity';
import { PlantedCulture } from '../src/planted_cultures/entities/planted_culture.entity';
import { RuralProperty } from '../src/rural_properties/entities/rural_property.entity';
import { Producer } from '../src/producers/entities/producer.entity';
import { City } from '../src/cities/entities/city.entity';
import { State } from '../src/states/entities/state.entity';
import { User } from '../src/users/entities/user.entity';
import { CreateRuralPropertyDto } from '../src/rural_properties/dto/create-rural_property.dto';
import { CreateCultivationDto } from '../src/cultivations/dto/create-cultivation.dto';

jest.setTimeout(30000);

describe('DashboardsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [TestModule],
      }).compile();

      app = moduleFixture.createNestApplication();

      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          stopAtFirstError: true,
        }),
      );

      await app.init();

      dataSource = moduleFixture.get<DataSource>(DataSource);
      await dataSource.synchronize(true);
    } catch (error) {
      console.error('Error during app initialization:', error);
      throw error; // Isso fará o teste falhar explicitamente se houver um erro de inicialização
    }
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  }, 10000);

  beforeEach(async () => {
    // Limpa as tabelas antes de cada teste
    await clearDatabase(dataSource, [
      Cultivation,
      Harvest,
      PlantedCulture,
      RuralProperty,
      Producer,
      City,
      State,
      User,
      // adicione outras entidades conforme necessário
    ]);

    accessToken = await setupAuthUser(app);

    const stateRes = await request(app.getHttpServer())
      .post('/states')
      .send({ uf: 'SP', name: 'São Paulo' })
      .set(authHeader(accessToken))
      .expect(201);

    const stateId = stateRes.body.id;

    const cityRes = await request(app.getHttpServer())
      .post('/cities')
      .send({ name: 'Campinas', state_id: stateId })
      .set(authHeader(accessToken))
      .expect(201);

    const cityId = cityRes.body.id;

    const producerRes = await request(app.getHttpServer())
      .post('/producers')
      .send({
        cpf_cnpj: '421.723.490-20',
        name: 'João Carlos',
        city_id: cityId,
      })
      .set(authHeader(accessToken))
      .expect(201);

    const producerId = producerRes.body.id;

    const harvestRes = await request(app.getHttpServer())
      .post('/harvests')
      .send({
        name: 'Safra 2021',
      })
      .set(authHeader(accessToken))
      .expect(201);

    const harvestId = harvestRes.body.id;

    const plantedCultureRes = await request(app.getHttpServer())
      .post('/planted-cultures')
      .send({
        name: 'Cultura de Pêra',
      })
      .set(authHeader(accessToken))
      .expect(201);

    const plantedCultureId = plantedCultureRes.body.id;

    const createRuralProperty: CreateRuralPropertyDto = {
      farm_name: 'Fazenda sol nascente',
      total_area: 8,
      arable_area: 4,
      vegetation_area: 4,
      producerId: producerId,
      cityId: cityId,
    };

    const ruralPropertyRes = await request(app.getHttpServer())
      .post('/rural-properties')
      .send(createRuralProperty)
      .set(authHeader(accessToken))
      .expect(201);

    const ruralPropertyId = ruralPropertyRes.body.id;

    const createCultivation: CreateCultivationDto = {
      rural_propertyId: ruralPropertyId,
      harvestId: harvestId,
      planted_cultureId: plantedCultureId,
    };

    await request(app.getHttpServer())
      .post('/cultivations')
      .send(createCultivation)
      .set(authHeader(accessToken))
      .expect(201);
  });

  describe('GET /dashboards', () => {
    it('should return a dashboard', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalRuralProperties');
      expect(response.body).toHaveProperty('totalAreal');
      expect(response.body).toHaveProperty('charts');
    });
  });
});
