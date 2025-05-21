import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RuralProperty } from '../../rural_properties/entities/rural_property.entity';
import { Harvest } from '../../harvests/entities/harvest.entity';
import { PlantedCulture } from '../../planted_cultures/entities/planted_culture.entity';

@Entity('cultivations')
export class Cultivation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => RuralProperty,
    (rural_property) => rural_property.cultivations,
  )
  rural_property: RuralProperty;

  @ManyToOne(() => Harvest, (harvest) => harvest.cultivations)
  harvest: Harvest;

  @ManyToOne(
    () => PlantedCulture,
    (planted_culture) => planted_culture.cultivations,
  )
  planted_culture: PlantedCulture;

  @ManyToOne(() => User, (user) => user.cultivations)
  created_by: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
