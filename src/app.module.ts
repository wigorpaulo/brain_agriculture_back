import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StatesModule } from './states/states.module';
import { CitiesModule } from './cities/cities.module';
import { HarvestsModule } from './harvests/harvests.module';
import { PlantedCulturesModule } from './planted_cultures/planted_cultures.module';
import { ProducersModule } from './producers/producers.module';
import { RuralPropertiesModule } from './rural_properties/rural_properties.module';
import { CultivationsModule } from './cultivations/cultivations.module';
import { DashboardsModule } from './dashboards/dashboards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    AuthModule,
    UsersModule,
    StatesModule,
    CitiesModule,
    HarvestsModule,
    PlantedCulturesModule,
    ProducersModule,
    RuralPropertiesModule,
    CultivationsModule,
    DashboardsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
