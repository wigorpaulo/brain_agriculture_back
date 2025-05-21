import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { State } from '../../states/entities/state.entity';
import { Producer } from '../../producers/entities/producer.entity';
import { RuralProperty } from '../../rural_properties/entities/rural_property.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @ManyToOne(() => State, (state) => state.cities)
  state: State;

  @OneToMany(() => Producer, (producer) => producer.city)
  producers: Producer[];

  @OneToMany(() => RuralProperty, (rural_property) => rural_property.city)
  rural_properties: RuralProperty[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
