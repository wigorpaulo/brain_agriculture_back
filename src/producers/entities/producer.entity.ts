import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { City } from '../../cities/entities/city.entity';
import { RuralProperty } from '../../rural_properties/entities/rural_property.entity';

@Entity('producers')
export class Producer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  cpf_cnpj: string;

  @Column({ type: 'varchar' })
  name: string;

  @OneToMany(() => RuralProperty, (rural_property) => rural_property.producer)
  rural_properties: RuralProperty[];

  @ManyToOne(() => City, (city) => city.producers)
  city: City;

  @ManyToOne(() => User, (user) => user.producers)
  created_by: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
