import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';

export type AuthenticatedUser = {
  accessToken: string;
  userId?: number;
};

/**
 * Cria um usuário e retorna o token JWT
 */
export async function loginUser(
  app: INestApplication,
  userData: {
    name: string;
    email: string;
    password: string;
  },
): Promise<AuthenticatedUser> {
  // Cria o usuário
  await request(app.getHttpServer())
    .post('/users')
    .send({
      name: userData.name,
      email: userData.email,
      password: userData.password,
    })
    .expect(201);

  // Faz login
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: userData.email,
      password: userData.password,
    })
    .expect(201);

  return {
    accessToken: loginResponse.body.access_token,
  };
}

export async function setupAuthUser(app: INestApplication): Promise<string> {
  const createUserDto: CreateUserDto = {
    name: 'João Silva',
    email: 'joao.silva@example.com',
    password: '123456',
  };

  const user = await loginUser(app, createUserDto);
  return user.accessToken;
}

/**
 * Retorna headers com o token autorizado
 */
export function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
