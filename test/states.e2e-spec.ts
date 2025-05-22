import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestModule } from './test.module';
import { DataSource } from 'typeorm';
import { clearDatabase } from './test-utils/truncate-helper';
import { setupAuthUser, authHeader } from './test-utils/auth-helper';
import { State } from '../src/states/entities/state.entity';
import { User } from '../src/users/entities/user.entity';
import { UpdateStateDto } from '../src/states/dto/update-state.dto';

jest.setTimeout(30000);

describe('StatesController (e2e)', () => {
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
  }, 30000);

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  }, 10000);

  beforeEach(async () => {
    // Limpa as tabelas antes de cada teste
    await clearDatabase(dataSource, [State, User]);

    accessToken = await setupAuthUser(app);
  });

  describe('POST /states', () => {
    it('should successfully create a state', async () => {
      const response = await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'SP', name: 'São Paulo' })
        .set(authHeader(accessToken));

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('São Paulo');
    });

    it('should fail when creating unnamed state', async () => {
      const response = await request(app.getHttpServer())
        .post('/states')
        .send({})
        .set(authHeader(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('name should not be empty'),
        ]),
      );
    });

    it('should fail when creating a state with existing name', async () => {
      await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'SP', name: 'São Jose' })
        .set(authHeader(accessToken))
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'SP', name: 'São Jose' })
        .set(authHeader(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Nome já cadastrado');
      expect(response.body.details.suggestion).toBe(
        'Escolha outro nome para o estado.',
      );
    });
  });

  describe('GET /states', () => {
    it('should return an empty list when there are no states', async () => {
      const response = await request(app.getHttpServer())
        .get('/states')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return a list with created states', async () => {
      await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'SP', name: 'São Paulo' })
        .set(authHeader(accessToken))
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/states')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('São Paulo');
    });
  });

  describe('GET /states/:id', () => {
    it('should return a state', async () => {
      const stateRes = await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'SP', name: 'São Paulo' })
        .set(authHeader(accessToken))
        .expect(201);

      const stateId = stateRes.body.id;

      const response = await request(app.getHttpServer())
        .get(`/states/${stateId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('São Paulo');
    });
  });

  describe('PATCH /states/:id', () => {
    it('should successfully update a state', async () => {
      const stateRes = await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'PR', name: 'Paraná' })
        .set(authHeader(accessToken))
        .expect(201);

      const stateId = stateRes.body.id;

      const updateDto: UpdateStateDto = { name: 'Curitiba' };

      const response = await request(app.getHttpServer())
        .patch(`/states/${stateId}`)
        .send(updateDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Curitiba');
    });
  });

  describe('DELETE /states/:id', () => {
    it('should successfully delete a state', async () => {
      const stateRes = await request(app.getHttpServer())
        .post('/states')
        .send({ uf: 'PR', name: 'Paraná' })
        .set(authHeader(accessToken))
        .expect(201);

      const stateId = stateRes.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/states/${stateId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
    });
  });
});
