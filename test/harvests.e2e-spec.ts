import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestModule } from './test.module';
import { DataSource } from 'typeorm';
import { clearDatabase } from './test-utils/truncate-helper';
import { setupAuthUser, authHeader } from './test-utils/auth-helper';
import { User } from '../src/users/entities/user.entity';
import { Harvest } from '../src/harvests/entities/harvest.entity';
import { UpdateHarvestDto } from '../src/harvests/dto/update-harvest.dto';

jest.setTimeout(30000);

describe('HarvestsController (e2e)', () => {
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

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    // Limpa as tabelas antes de cada teste
    await clearDatabase(dataSource, [Harvest, User]);

    accessToken = await setupAuthUser(app);
  });

  describe('POST /harvests', () => {
    it('should successfully create a harvest', async () => {
      const response = await request(app.getHttpServer())
        .post('/harvests')
        .send({
          name: 'Safra 2021',
        })
        .set(authHeader(accessToken));

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Safra 2021');
    });

    it('should fail when creating unnamed harvest', async () => {
      const response = await request(app.getHttpServer())
        .post('/harvests')
        .send({})
        .set(authHeader(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining(['name should not be empty']),
      );
    });

    it('should fail when creating a harvest with existing name', async () => {
      await request(app.getHttpServer())
        .post('/harvests')
        .send({
          name: 'Safra 2021',
        })
        .set(authHeader(accessToken))
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/harvests')
        .send({
          name: 'Safra 2021',
        })
        .set(authHeader(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Nome já cadastrado');
      expect(response.body.details.suggestion).toBe(
        'Escolha outro nome para a safra.',
      );
    });
  });

  describe('GET /harvests', () => {
    it('should return an empty list when there are no harvests', async () => {
      const response = await request(app.getHttpServer())
        .get('/harvests')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return a list with created harvests', async () => {
      await request(app.getHttpServer())
        .post('/harvests')
        .send({
          name: 'Safra 2021',
        })
        .set(authHeader(accessToken))
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/harvests')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Safra 2021');
    });
  });

  describe('GET /harvests/:id', () => {
    it('should return a harvest', async () => {
      const harvestRes = await request(app.getHttpServer())
        .post('/harvests')
        .send({
          name: 'Safra 2021',
        })
        .set(authHeader(accessToken))
        .expect(201);

      const harvestId = harvestRes.body.id;

      const response = await request(app.getHttpServer())
        .get(`/harvests/${harvestId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Safra 2021');
    });
  });

  describe('PATCH /harvests/:id', () => {
    it('should successfully update a harvest', async () => {
      const harvestRes = await request(app.getHttpServer())
        .post('/harvests')
        .send({
          name: 'Safra 2021',
        })
        .set(authHeader(accessToken))
        .expect(201);

      const harvestId = harvestRes.body.id;

      const updateDto: UpdateHarvestDto = { name: 'Safra 2021 - 2' };

      const response = await request(app.getHttpServer())
        .patch(`/harvests/${harvestId}`)
        .send(updateDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Safra 2021 - 2');
    });
  });

  describe('DELETE /harvests/:id', () => {
    it('should successfully delete a harvest', async () => {
      const harvestRes = await request(app.getHttpServer())
        .post('/harvests')
        .send({
          name: 'Safra 2021',
        })
        .set(authHeader(accessToken))
        .expect(201);

      const harvestId = harvestRes.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/harvests/${harvestId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
    });
  });
});
