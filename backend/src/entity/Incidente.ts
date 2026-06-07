import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Reclamo } from './Reclamo';
import { Tarea } from './Tarea';

export type NivelGravedad = 'Baja' | 'Media' | 'Alta';
export type EstadoIncidente = 'Abierto' | 'En progreso' | 'Resuelto';

@Entity('Incidente')
export class Incidente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nivel_gravedad', type: 'text' })
  nivelGravedad!: NivelGravedad;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'text', default: 'Abierto' })
  estado!: EstadoIncidente;

  @Column({ name: 'reclamo_id', type: 'integer', nullable: true })
  reclamoId!: number | null;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;

  @OneToOne(() => Reclamo, (reclamo) => reclamo.incidente)
  reclamo!: Reclamo | null;

  @OneToMany(() => Tarea, (tarea) => tarea.incidente)
  tareas!: Tarea[];
}
