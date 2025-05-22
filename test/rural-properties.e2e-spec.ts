import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestModule } from './test.module';
import { DataSource } from 'typeorm';
import { clearDatabase } from './test-utils/truncate-helper';
import { setupAuthUser, authHeader } from './test-utils/auth-helper';
import { Producer } from '../src/producers/entities/producer.entity';
import { City } from '../src/cities/entities/city.entity';
import { State } from '../src/states/entities/state.entity';
import { User } from '../src/users/entities/user.entity';
import { RuralProperty } from '../src/rural_properties/entities/rural_property.entity';
import { CreateRuralPropertyDto } from '../src/rural_properties/dto/create-rural_property.dto';
import { UpdateRuralPropertyDto } from '../src/rural_properties/dto/update-rural_property.dto';

jest.setTimeout(30000);

describe('RuralPropertiesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let producerId: number;
  let cityId: number;

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
  }, 30000);

  afterAll(async () => {
    await dataSource.destroy();
    if (app) {
      await app.close();
    }
  }, 10000);

  beforeEach(async () => {
    // Limpa as tabelas antes de cada teste
    await clearDatabase(dataSource, [
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

    cityId = cityRes.body.id;

    const producerRes = await request(app.getHttpServer())
      .post('/producers')
      .send({
        cpf_cnpj: '421.723.490-20',
        name: 'João Carlos',
        city_id: cityId,
      })
      .set(authHeader(accessToken))
      .expect(201);

    producerId = producerRes.body.id;
  });

  describe('POST /rural-properties', () => {
    it('should successfully create a rural property', async () => {
      const createDto: CreateRuralPropertyDto = {
        farm_name: 'Fazenda sol nascente',
        total_area: 8,
        arable_area: 4,
        vegetation_area: 4,
        producerId: producerId,
        cityId: cityId,
      };

      const response = await request(app.getHttpServer())
        .post('/rural-properties')
        .send(createDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.farm_name).toBe('Fazenda sol nascente');
    });

    it('should fail when creating a rural property with sum arable area and  vegetation area greater than total area', async () => {
      const createDto: CreateRuralPropertyDto = {
        farm_name: 'Fazenda sol nascente',
        total_area: 8,
        arable_area: 5,
        vegetation_area: 4,
        producerId: producerId,
        cityId: cityId,
      };

      const response = await request(app.getHttpServer())
        .post('/rural-properties')
        .send(createDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        'Área total não pode ser maior que a soma das áreas agricultável e vegetação',
      );
      expect(response.body.details.suggestion).toBe(
        'Verifique os valores das áreas agricultável e vegetação e tente novamente.',
      );
    });
  });

  describe('GET /rural-properties', () => {
    it('should return an empty list when there are no rural properties', async () => {
      const response = await request(app.getHttpServer())
        .get('/rural-properties')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return a list with created rural properties', async () => {
      const createDto: CreateRuralPropertyDto = {
        farm_name: 'Fazenda sol nascente',
        total_area: 8,
        arable_area: 4,
        vegetation_area: 4,
        producerId: producerId,
        cityId: cityId,
      };

      await request(app.getHttpServer())
        .post('/rural-properties')
        .send(createDto)
        .set(authHeader(accessToken))
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/rural-properties')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].farm_name).toBe('Fazenda sol nascente');
    });
  });

  describe('GET /rural-properties/:id', () => {
    it('should return a rural property', async () => {
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

      const ruralPropertyId = ruralPropertyRes.body.id;

      const response = await request(app.getHttpServer())
        .get(`/rural-properties/${ruralPropertyId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.farm_name).toBe('Fazenda sol nascente');
    });
  });

  describe('PATCH /rural-properties/:id', () => {
    it('should successfully update a rural property', async () => {
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

      const ruralPropertyId = ruralPropertyRes.body.id;

      const updateDto: UpdateRuralPropertyDto = {
        farm_name: 'Fazenda sol nascente 2',
        total_area: 10,
        arable_area: 5,
        vegetation_area: 5,
      };

      const response = await request(app.getHttpServer())
        .patch(`/rural-properties/${ruralPropertyId}`)
        .send(updateDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.farm_name).toBe('Fazenda sol nascente 2');
      expect(response.body.total_area).toBe(10);
    });
  });

  describe('DELETE /rural-properties/:id', () => {
    it('should successfully delete a rural property', async () => {
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

      const ruralPropertyId = ruralPropertyRes.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/rural-properties/${ruralPropertyId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
    });
  });
});
