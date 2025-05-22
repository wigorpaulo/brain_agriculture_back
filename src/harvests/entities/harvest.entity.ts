import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Cultivation } from '../../cultivations/entities/cultivation.entity';

@Entity('harvests')
export class Harvest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @ManyToOne(() => User, (user) => user.harvests)
  created_by: User;

  @OneToMany(() => Cultivation, (cultivation) => cultivation.harvest)
  cultivations: Cultivation[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
