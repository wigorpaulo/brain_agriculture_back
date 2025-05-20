import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { City } from '../../cities/entities/city.entity';

@Entity('states')
export class State {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  uf: string;

  @Column({ type: 'varchar' })
  name: string;

  @OneToMany(() => City, (city) => city.state)
  cities: City[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
