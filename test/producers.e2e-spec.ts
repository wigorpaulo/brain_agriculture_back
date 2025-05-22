import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TestModule } from './test.module';
import { DataSource } from 'typeorm';
import { clearDatabase } from './test-utils/truncate-helper';
import { setupAuthUser, authHeader } from './test-utils/auth-helper';
import { City } from '../src/cities/entities/city.entity';
import { User } from '../src/users/entities/user.entity';
import { Producer } from '../src/producers/entities/producer.entity';
import { CreateProducerDto } from '../src/producers/dto/create-producer.dto';
import { UpdateProducerDto } from '../src/producers/dto/update-producer.dto';
import { State } from '../src/states/entities/state.entity';

jest.setTimeout(30000);

describe('ProducersController (e2e)', () => {
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
    await dataSource.destroy();
    await app.close();
  }, 10000);

  beforeEach(async () => {
    // Limpa as tabelas antes de cada teste
    await clearDatabase(dataSource, [
      Producer,
      City,
      State,
      User,
      // adicione outras entidades conforme necessário
    ]);

    accessToken = await setupAuthUser(app);
  });

  describe('POST /producers', () => {
    let cityId: number;

    beforeEach(async () => {
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
    });

    it('should successfully create a producer', async () => {
      const createDto: CreateProducerDto = {
        cpf_cnpj: '421.723.490-20',
        name: 'João Carlos',
        city_id: cityId,
      };

      const response = await request(app.getHttpServer())
        .post('/producers')
        .send(createDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('João Carlos');
    });

    it('should fail when creating a producer with existing cpf_cnpj', async () => {
      const createDto: CreateProducerDto = {
        cpf_cnpj: '421.723.490-20',
        name: 'João Carlos',
        city_id: cityId,
      };

      await request(app.getHttpServer())
        .post('/producers')
        .send(createDto)
        .set(authHeader(accessToken))
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/producers')
        .send(createDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('CPF ou CNPJ já cadastrado');
    });

    it('should fail when creating producer with invalid city', async () => {
      const createDto: CreateProducerDto = {
        cpf_cnpj: '421.723.490-20',
        name: 'João Carlos',
        city_id: 1000,
      };

      const response = await request(app.getHttpServer())
        .post('/producers')
        .send(createDto)
        .set(authHeader(accessToken));

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Cidade não encontrada');
      expect(response.body.details.suggestion).toBe(
        'Verifique se o ID está correto ou liste as cidades disponíveis primeiro',
      );
    });
  });

  describe('GET /producers', () => {
    let cityId: number;

    beforeEach(async () => {
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
    });

    it('should return an empty list when there are no producers', async () => {
      const response = await request(app.getHttpServer())
        .get('/producers')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return a list with created producers', async () => {
      const createDto: CreateProducerDto = {
        cpf_cnpj: '421.723.490-20',
        name: 'João Carlos',
        city_id: cityId,
      };

      await request(app.getHttpServer())
        .post('/producers')
        .send(createDto)
        .set(authHeader(accessToken))
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/producers')
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('João Carlos');
    });
  });

  describe('GET /producers/:id', () => {
    let cityId: number;

    beforeEach(async () => {
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
    });

    it('should return a producer', async () => {
      const createDto: CreateProducerDto = {
        cpf_cnpj: '421.723.490-20',
        name: 'João Carlos',
        city_id: cityId,
      };

      const producerRes = await request(app.getHttpServer())
        .post('/producers')
        .send(createDto)
        .set(authHeader(accessToken))
        .expect(201);

      const producerId = producerRes.body.id;

      const response = await request(app.getHttpServer())
        .get(`/producers/${producerId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('João Carlos');
    });
  });

  describe('PATCH /producers/:id', () => {
    let cityId: number;

    beforeEach(async () => {
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
    });

    it('should successfully update a producer', async () => {
      const createDto: CreateProducerDto = {
        cpf_cnpj: '421.723.490-20',
        name: 'João Carlos',
        city_id: cityId,
      };

      const producerRes = await request(app.getHttpServer())
        .post('/producers')
        .send(createDto)
        .set(authHeader(accessToken))
        .expect(201);

      const producerId = producerRes.body.id;

      const updateDto: UpdateProducerDto = {
        name: 'Antonio',
      };

      const response = await request(app.getHttpServer())
        .patch(`/producers/${producerId}`)
        .set(authHeader(accessToken))
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Antonio');
    });
  });

  describe('DELETE /producers/:id', () => {
    let cityId: number;

    beforeEach(async () => {
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
    });

    it('should successfully delete a producer', async () => {
      const createDto: CreateProducerDto = {
        cpf_cnpj: '421.723.490-20',
        name: 'João Carlos',
        city_id: cityId,
      };

      const producerRes = await request(app.getHttpServer())
        .post('/producers')
        .send(createDto)
        .set(authHeader(accessToken))
        .expect(201);

      const producerId = producerRes.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/producers/${producerId}`)
        .set(authHeader(accessToken));

      expect(response.status).toBe(200);
    });
  });
});
