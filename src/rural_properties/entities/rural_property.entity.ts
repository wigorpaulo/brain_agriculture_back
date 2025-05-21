import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Producer } from '../../producers/entities/producer.entity';
import { City } from '../../cities/entities/city.entity';
import { Cultivation } from '../../cultivations/entities/cultivation.entity';

@Entity('rural_properties')
export class RuralProperty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  farm_name: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total_area: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  arable_area: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  vegetation_area: number;

  @ManyToOne(() => Producer, (producer) => producer.rural_properties, {
    onDelete: 'CASCADE',
  })
  producer: Producer;

  @ManyToOne(() => City, (city) => city.rural_properties)
  city: City;

  @ManyToOne(() => User, (user) => user.rural_properties)
  created_by: User;

  @OneToMany(() => Cultivation, (cultivation) => cultivation.rural_property)
  cultivations: Cultivation[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
