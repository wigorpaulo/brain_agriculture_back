import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { TestModule } from './test.module'; // seu módulo de teste compartilhado
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../src/users/dto/update-user.dto';
import { User } from '../src/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { clearDatabase } from './test-utils/truncate-helper'; // opcional
import { ValidationPipe } from '@nestjs/common';

jest.setTimeout(30000);

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule, UsersModule],
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

  beforeEach(async () => {
    await clearDatabase(dataSource, [User]); // limpa antes de cada teste
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  }, 10000);

  describe('POST /users', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao.silva@example.com',
        password: '123456',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createUserDto.name);
      expect(response.body.email).toBe(createUserDto.email);
    });

    it('should fail when trying to create user without name', async () => {
      const dto: Partial<CreateUserDto> = {
        email: 'teste@teste.com',
        password: '123456',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(dto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('name should not be empty'),
        ]),
      );
    });

    it('should fail when trying to create user without email', async () => {
      const dto: Partial<CreateUserDto> = {
        name: 'Maria Souza',
        password: '123456',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(dto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('email should not be empty'),
        ]),
      );
    });

    it('should fail when trying to create user without password', async () => {
      const dto: Partial<CreateUserDto> = {
        name: 'Maria Souza',
        email: 'teste@teste.com',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(dto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('password should not be empty'),
        ]),
      );
    });

    it('should fail when trying to create user with already existing email', async () => {
      const createUserDto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao.silva@example.com',
        password: '123456',
      };

      await request(app.getHttpServer()).post('/users').send(createUserDto);

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('E-mail já cadastrado');
      expect(response.body.details.suggestion).toBe(
        'Escolha outro e-mail.',
      );
    });
  });

  describe('GET /users', () => {
    it('should return an empty list when there are no users', async () => {
      const response = await request(app.getHttpServer()).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return a list with created users', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Ana Costa',
        email: 'ana.costa@example.com',
        password: '123456',
      };

      await request(app.getHttpServer()).post('/users').send(createUserDto);

      const response = await request(app.getHttpServer()).get('/users');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe(createUserDto.name);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update an existing user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Carlos Almeida',
        email: 'carlos.almeida@example.com',
        password: '123456',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      const userId = createResponse.body.id;

      const updateUserDto: UpdateUserDto = {
        name: 'Carlos Almeida Jr.',
        email: 'carlos.jr@example.com',
      };

      const updateResponse = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send(updateUserDto)
        .expect(200);

      expect(updateResponse.body.name).toBe(updateUserDto.name);
      expect(updateResponse.body.email).toBe(updateUserDto.email);
    });

    it('should return 404 when trying to update non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Usuário Inexistente',
        email: 'inexistente@example.com',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/999')
        .send(updateUserDto)
        .expect(404);

      expect(response.body.message).toBe('Usuário não encontrado');
      expect(response.body.details.suggestion).toBe(
        'Verifique se o ID está correto ou liste os usuparios disponíveis primeiro',
      );
    });
  });
});
