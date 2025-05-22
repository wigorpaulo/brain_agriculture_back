import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestModule } from './test.module';
import { DataSource } from 'typeorm';
import { clearDatabase } from './test-utils/truncate-helper';
import { City } from '../src/cities/entities/city.entity';
import { State } from '../src/states/entities/state.entity';
import { CitiesModule } from '../src/cities/cities.module';
import { User } from '../src/users/entities/user.entity';
import { authHeader, setupAuthUser } from './test-utils/auth-helper';
import { UpdateCityDto } from '../src/cities/dto/update-city.dto';

jest.setTimeout(30000);

describe('CitiesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [TestModule, CitiesModule],
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
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    // Limpa as tabelas antes de cada teste
    await clearDatabase(dataSource, [
      City, // tem foreign key para State
      State,
      User,
      // adicione outras entidades conforme necessário
    ]);

    accessToken = await setupAuthUser(app);
  });

  describe('POST /cities', () => {
    it('should successfully create a city', async () => {
      const stateRes = await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'SP', name: 'São Paulo' })
        .set(authHeader(accessToken))
        .expect(201);

      const stateId = stateRes.body.id;

      const response = await request(app.getHttpServer())
        .post('/cities')
        .send({ name: 'Campinas', state_id: stateId })
        .set(authHeader(accessToken));

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Campinas');
    });

    it('should fail when creating unnamed city', async () => {
      const response = await request(app.getHttpServer())
        .post('/cities')
        .send({})
        .set(authHeader(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('name should not be empty'),
          expect.stringContaining('state_id should not be empty'),
        ]),
      );
    });

    it('should fail when creating city with invalid state', async () => {
      const response = await request(app.getHttpServer())
        .post('/cities')
        .send({ name: 'Campinas', state_id: 1000 })
        .set(authHeader(accessToken));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Estado não encontrado');
      expect(response.body.details.suggestion).toBe(
        'Verifique se o ID está correto ou liste os estado disponíveis primeiro',
      );
    });

    it('should fail when trying to create city without name', async () => {
      const stateRes = await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'SP', name: 'São Paulo' })
        .set(authHeader(accessToken))
        .expect(201);

      const stateId = stateRes.body.id;

      const response = await request(app.getHttpServer())
        .post('/cities')
        .send({ state_id: stateId })
        .set(authHeader(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('name should not be empty'),
        ]),
      );
    });

    it('should fail when creating a city with existing name', async () => {
      const stateRes = await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'SP', name: 'São Paulo' })
        .set(authHeader(accessToken))
        .expect(201);

      const stateId = stateRes.body.id;

      await request(app.getHttpServer())
        .post('/cities')
        .send({ name: 'Campinas', state_id: stateId })
        .set(authHeader(accessToken));

      const response = await request(app.getHttpServer())
        .post('/cities')
        .send({ name: 'Campinas', state_id: stateId })
        .set(authHeader(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Nome já cadastrado');
      expect(response.body.details.suggestion).toBe(
        'Escolha outro nome para a cidade.',
      );
    });
  });

  describe('GET /cities', () => {
    it('should return an empty list if there are no cities', async () => {
      const response = await request(app.getHttpServer())
        .get('/cities')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return a created city', async () => {
      const stateRes = await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'PR', name: 'Paraná' })
        .set(authHeader(accessToken))
        .expect(201);

      const stateId = stateRes.body.id;

      await request(app.getHttpServer())
        .post('/cities')
        .send({ name: 'Curitiba', state_id: stateId })
        .set(authHeader(accessToken))
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/cities')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Curitiba');
    });
  });

  describe('GET /cities/:id', () => {
    it('should return a city', async () => {
      const stateRes = await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'PR', name: 'Paraná' })
        .set(authHeader(accessToken))
        .expect(201);

      const stateId = stateRes.body.id;

      const cityRes = await request(app.getHttpServer())
        .post('/cities')
        .send({ name: 'Curitiba', state_id: stateId })
        .set(authHeader(accessToken))
        .expect(201);

      const cityId = cityRes.body.id;

      const response = await request(app.getHttpServer())
        .get(`/cities/${cityId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /cities/:id', () => {
    it('should successfully update a city', async () => {
      const stateRes = await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'PR', name: 'Paraná' })
        .set(authHeader(accessToken))
        .expect(201);

      const stateId = stateRes.body.id;

      const cityRes = await request(app.getHttpServer())
        .post('/cities')
        .send({ name: 'Curitiba', state_id: stateId })
        .set(authHeader(accessToken))
        .expect(201);

      const cityId = cityRes.body.id;

      const updateDto: UpdateCityDto = { name: 'Piracicaba Nova' };

      const response = await request(app.getHttpServer())
        .patch(`/cities/${cityId}`)
        .set(authHeader(accessToken))
        .send(updateDto);

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /cities/:id', () => {
    it('should successfully delete a city', async () => {
      const stateRes = await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'PR', name: 'Paraná' })
        .set(authHeader(accessToken))
        .expect(201);

      const stateId = stateRes.body.id;

      const cityRes = await request(app.getHttpServer())
        .post('/cities')
        .send({ name: 'Curitiba', state_id: stateId })
        .set(authHeader(accessToken))
        .expect(201);

      const cityId = cityRes.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/cities/${cityId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
    });
  });
});
