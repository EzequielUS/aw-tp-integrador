import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Reclamo } from './Reclamo';

@Entity('Unidad')
export class Unidad {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  numero!: string;

  @Column({ type: 'integer', nullable: true })
  piso!: number | null;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;

  @OneToMany(() => Reclamo, (reclamo) => reclamo.unidad)
  reclamos!: Reclamo[];
}
