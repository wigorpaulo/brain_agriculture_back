import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Harvest } from '../../harvests/entities/harvest.entity';
import { PlantedCulture } from '../../planted_cultures/entities/planted_culture.entity';

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
