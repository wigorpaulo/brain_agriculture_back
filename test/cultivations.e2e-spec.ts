import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestModule } from './test.module';
import { DataSource } from 'typeorm';
import { clearDatabase } from './test-utils/truncate-helper';
import { setupAuthUser, authHeader } from './test-utils/auth-helper';
import { RuralProperty } from '../src/rural_properties/entities/rural_property.entity';
import { Producer } from '../src/producers/entities/producer.entity';
import { City } from '../src/cities/entities/city.entity';
import { State } from '../src/states/entities/state.entity';
import { User } from '../src/users/entities/user.entity';
import { CreateRuralPropertyDto } from '../src/rural_properties/dto/create-rural_property.dto';
import { CreateCultivationDto } from '../src/cultivations/dto/create-cultivation.dto';
import { Cultivation } from '../src/cultivations/entities/cultivation.entity';
import { Harvest } from '../src/harvests/entities/harvest.entity';
import { PlantedCulture } from '../src/planted_cultures/entities/planted_culture.entity';
import { UpdateCultivationDto } from '../src/cultivations/dto/update-cultivation.dto';

jest.setTimeout(30000);

describe('CultivationsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let ruralPropertyId: number;
  let harvestId: number;
  let plantedCultureId: number;

  beforeAll(async () => {
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

    harvestId = harvestRes.body.id;

    const plantedCultureRes = await request(app.getHttpServer())
      .post('/planted-cultures')
      .send({
        name: 'Cultura de Pêra',
      })
      .set(authHeader(accessToken))
      .expect(201);

    plantedCultureId = plantedCultureRes.body.id;

    const createDto: CreateRuralPropertyDto = {
      farm_name: 'Fazenda sol nascente',
      total_area: 8,
      arable_area: 4,
      vegetation_area: 4,
      producerId: producerId,
      cityId: cityId,
    };

    const ruralPropertyRes = await request(app.getHttpServer())
      .post('/rural-properties')
      .send(createDto)
      .set(authHeader(accessToken))
      .expect(201);

    ruralPropertyId = ruralPropertyRes.body.id;
  });

  describe('POST /cultivations', () => {
    it('should successfully create a cultivation', async () => {
      const createDto: CreateCultivationDto = {
        rural_propertyId: ruralPropertyId,
        harvestId: harvestId,
        planted_cultureId: plantedCultureId,
      };

      const response = await request(app.getHttpServer())
        .post('/cultivations')
        .send(createDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should fail when creating a cultivation with invalid rural property', async () => {
      const createDto: CreateCultivationDto = {
        rural_propertyId: 1000,
        harvestId: harvestId,
        planted_cultureId: plantedCultureId,
      };

      const response = await request(app.getHttpServer())
        .post('/cultivations')
        .send(createDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Propriedade rural não encontrada');
      expect(response.body.details.suggestion).toBe(
        'Verifique se o ID está correto ou liste as propriedade rural disponíveis primeiro',
      );
    });

    it('should fail when creating a cultivation with invalid harvest', async () => {
      const createDto: CreateCultivationDto = {
        rural_propertyId: ruralPropertyId,
        harvestId: 1000,
        planted_cultureId: plantedCultureId,
      };

      const response = await request(app.getHttpServer())
        .post('/cultivations')
        .send(createDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Safra não encontrada');
      expect(response.body.details.suggestion).toBe(
        'Verifique se o ID está correto ou liste as safras disponíveis primeiro',
      );
    });

    it('should fail when creating a cultivation with invalid planted culture', async () => {
      const createDto: CreateCultivationDto = {
        rural_propertyId: ruralPropertyId,
        harvestId: harvestId,
        planted_cultureId: 1000,
      };

      const response = await request(app.getHttpServer())
        .post('/cultivations')
        .send(createDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Cultura plantada não encontrada');
      expect(response.body.details.suggestion).toBe(
        'Verifique se o ID está correto ou liste as cultura plantada disponíveis primeiro',
      );
    });
  });

  describe('GET /cultivations', () => {
    it('should return an empty list when there are no cultivations', async () => {
      const response = await request(app.getHttpServer())
        .get('/cultivations')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return a list with created cultivations', async () => {
      const createDto: CreateCultivationDto = {
        rural_propertyId: ruralPropertyId,
        harvestId: harvestId,
        planted_cultureId: plantedCultureId,
      };

      await request(app.getHttpServer())
        .post('/cultivations')
        .send(createDto)
        .set(authHeader(accessToken))
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/cultivations')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });
  });

  describe('GET /cultivations/:id', () => {
    it('should return a cultivation', async () => {
      const createDto: CreateCultivationDto = {
        rural_propertyId: ruralPropertyId,
        harvestId: harvestId,
        planted_cultureId: plantedCultureId,
      };

      const cultivationRes = await request(app.getHttpServer())
        .post('/cultivations')
        .send(createDto)
        .set(authHeader(accessToken))
        .expect(201);

      const cultivationId = cultivationRes.body.id;

      const response = await request(app.getHttpServer())
        .get(`/cultivations/${cultivationId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(cultivationId);
    });
  });

  describe('PATCH /cultivations/:id', () => {
    it('should successfully update a cultivation', async () => {
      const createDto: CreateCultivationDto = {
        rural_propertyId: ruralPropertyId,
        harvestId: harvestId,
        planted_cultureId: plantedCultureId,
      };

      const cultivationRes = await request(app.getHttpServer())
        .post('/cultivations')
        .send(createDto)
        .set(authHeader(accessToken))
        .expect(201);

      const cultivationId = cultivationRes.body.id;

      const plantedCultureRes = await request(app.getHttpServer())
        .post('/planted-cultures')
        .send({
          name: 'Cultura de Laranaja',
        })
        .set(authHeader(accessToken))
        .expect(201);

      const newPlantedCultureId = plantedCultureRes.body.id;

      const updateDto: UpdateCultivationDto = {
        planted_cultureId: newPlantedCultureId,
      };

      const response = await request(app.getHttpServer())
        .patch(`/cultivations/${cultivationId}`)
        .send(updateDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.planted_culture.id).toBe(newPlantedCultureId);
    });
  });

  describe('DELETE /cultivations/:id', () => {
    it('should successfully delete a cultivation', async () => {
      const createDto: CreateCultivationDto = {
        rural_propertyId: ruralPropertyId,
        harvestId: harvestId,
        planted_cultureId: plantedCultureId,
      };

      const cultivationRes = await request(app.getHttpServer())
        .post('/cultivations')
        .send(createDto)
        .set(authHeader(accessToken))
        .expect(201);

      const cultivationId = cultivationRes.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/cultivations/${cultivationId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
    });
  });
});
