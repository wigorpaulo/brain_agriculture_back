import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

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

/**
 * Retorna headers com o token autorizado
 */
export function authHeader(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
