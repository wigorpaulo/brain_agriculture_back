import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CitiesModule } from '../src/cities/cities.module';
import { StatesModule } from '../src/states/states.module';
import { UsersModule } from '../src/users/users.module';
import { AuthModule } from '../src/auth/auth.module';
import { City } from '../src/cities/entities/city.entity';
import { State } from '../src/states/entities/state.entity';
import { HarvestsModule } from '../src/harvests/harvests.module';
import { Harvest } from '../src/harvests/entities/harvest.entity';
import { PlantedCulture } from '../src/planted_cultures/entities/planted_culture.entity';
import { PlantedCulturesModule } from '../src/planted_cultures/planted_cultures.module';
import { ProducersModule } from '../src/producers/producers.module';
import { Producer } from '../src/producers/entities/producer.entity';
import { RuralPropertiesModule } from '../src/rural_properties/rural_properties.module';
import { RuralProperty } from '../src/rural_properties/entities/rural_property.entity';
import { CultivationsModule } from '../src/cultivations/cultivations.module';
import { Cultivation } from '../src/cultivations/entities/cultivation.entity';
import { DashboardsModule } from '../src/dashboards/dashboards.module';

// importe outros módulos que deseja testar

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.test',
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'), // Ex: brain_agriculture_test
        entities: [__dirname + '/../src/**/*.entity.{ts,js}'],
        synchronize: true, // use com cuidado em produção
        dropSchema: true, // recria o schema a cada execução de teste
      }),
    }),
    TypeOrmModule.forFeature([
      City,
      State,
      Harvest,
      PlantedCulture,
      Producer,
      RuralProperty,
      Cultivation,
    ]),
    forwardRef(() => CitiesModule),
    forwardRef(() => StatesModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => HarvestsModule),
    forwardRef(() => PlantedCulturesModule),
    forwardRef(() => ProducersModule),
    forwardRef(() => RuralPropertiesModule),
    forwardRef(() => CultivationsModule),
    forwardRef(() => DashboardsModule),
    // outros módulos aqui
  ],
  exports: [TypeOrmModule],
})
export class TestModule {}
