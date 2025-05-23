import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'brain-agriculture-back-db.internal',
  port: 5433,
  username: 'postgres',
  password: 'hFqJzcDgH9U2NdO',
  database: 'brain_agriculture_back',
  synchronize: false,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*.ts'],
});
