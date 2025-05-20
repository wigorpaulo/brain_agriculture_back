import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('states')
export class State {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  uf: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
