import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Harvest } from '../../harvests/entities/harvest.entity';
import { PlantedCulture } from '../../planted_cultures/entities/planted_culture.entity';
import { Producer } from '../../producers/entities/producer.entity';
import { RuralProperty } from '../../rural_properties/entities/rural_property.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @OneToMany(() => Harvest, (harvest) => harvest.created_by)
  harvests: Harvest[];

  @OneToMany(
    () => PlantedCulture,
    (planted_culture) => planted_culture.created_by,
  )
  planted_cultures: PlantedCulture[];

  @OneToMany(() => Producer, (producer) => producer.created_by)
  producers: Producer[];

  @OneToMany(() => RuralProperty, (rural_property) => rural_property.created_by)
  rural_properties: RuralProperty[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
