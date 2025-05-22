import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestModule } from './test.module';
import { DataSource } from 'typeorm';
import { clearDatabase } from './test-utils/truncate-helper';
import { setupAuthUser, authHeader } from './test-utils/auth-helper';
import { User } from '../src/users/entities/user.entity';
import { PlantedCulture } from '../src/planted_cultures/entities/planted_culture.entity';
import { UpdatePlantedCultureDto } from '../src/planted_cultures/dto/update-planted_culture.dto';

describe('PlantedCulturesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;

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

    dataSource = moduleFixture.get<DataSource>(DataSource);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Limpa as tabelas antes de cada teste
    await clearDatabase(dataSource, [PlantedCulture, User]);

    accessToken = await setupAuthUser(app);
  });

  describe('POST /planted-cultures', () => {
    it('should successfully create a planted culture', async () => {
      const response = await request(app.getHttpServer())
        .post('/planted-cultures')
        .send({ name: 'Cultura de Pêra' })
        .set(authHeader(accessToken));

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Cultura de Pêra');
    });

    it('should fail when creating unnamed planted culture', async () => {
      const response = await request(app.getHttpServer())
        .post('/planted-cultures')
        .send({})
        .set(authHeader(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('name should not be empty'),
        ]),
      );
    });

    it('should fail when creating a planted culture with existing name', async () => {
      await request(app.getHttpServer())
        .post('/planted-cultures')
        .send({ name: 'Cultura de Pêra' })
        .set(authHeader(accessToken))
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/planted-cultures')
        .send({ name: 'Cultura de Pêra' })
        .set(authHeader(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Nome já cadastrado');
      expect(response.body.details.suggestion).toBe(
        'Escolha outro nome para a cultura plantada.',
      );
    });
  });

  describe('GET /planted-cultures', () => {
    it('should return an empty list when there are no planted cultures', async () => {
      const response = await request(app.getHttpServer())
        .get('/planted-cultures')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return a list with created planted cultures', async () => {
      await request(app.getHttpServer())
        .post('/planted-cultures')
        .send({ name: 'Cultura de Pêra' })
        .set(authHeader(accessToken))
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/planted-cultures')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Cultura de Pêra');
    });
  });

  describe('GET /planted-cultures/:id', () => {
    it('should return a planted culture', async () => {
      const plantedCultureRes = await request(app.getHttpServer())
        .post('/planted-cultures')
        .send({ name: 'Cultura de Pêra' })
        .set(authHeader(accessToken))
        .expect(201);

      const plantedCultureId = plantedCultureRes.body.id;

      const response = await request(app.getHttpServer())
        .get(`/planted-cultures/${plantedCultureId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Cultura de Pêra');
    });
  });

  describe('PATCH /planted-cultures/:id', () => {
    it('should successfully update a planted culture', async () => {
      const plantedCultureRes = await request(app.getHttpServer())
        .post('/planted-cultures')
        .send({ name: 'Cultura de Pêra' })
        .set(authHeader(accessToken))
        .expect(201);

      const plantedCultureId = plantedCultureRes.body.id;

      const updateDto: UpdatePlantedCultureDto = { name: 'Cultura de Pêra 2' };

      const response = await request(app.getHttpServer())
        .patch(`/planted-cultures/${plantedCultureId}`)
        .send(updateDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Cultura de Pêra 2');
    });
  });

  describe('DELETE /planted-cultures/:id', () => {
    it('should successfully delete a planted culture', async () => {
      const plantedCultureRes = await request(app.getHttpServer())
        .post('/planted-cultures')
        .send({ name: 'Cultura de Pêra' })
        .set(authHeader(accessToken))
        .expect(201);

      const plantedCultureId = plantedCultureRes.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/planted-cultures/${plantedCultureId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
    });
  });
});
