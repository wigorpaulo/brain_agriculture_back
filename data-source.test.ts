import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config({ path: `.env.test` });

export const testDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  dropSchema: true, // limpa o schema antes de cada execução
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*.ts'],
});
