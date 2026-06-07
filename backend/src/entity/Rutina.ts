import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Persona } from './Persona';
import { Tarea } from './Tarea';

export type EstadoRutina = 'Pendiente' | 'En progreso' | 'Completada';

@Entity('Rutina')
@Unique(['encargadoId', 'fechaAsignacion'])
export class Rutina {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'encargado_id' })
  encargadoId!: number;

  @Column({ name: 'fecha_asignacion', type: 'date' })
  fechaAsignacion!: string;

  @Column({ type: 'text', default: 'Pendiente' })
  estado!: EstadoRutina;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;

  @ManyToOne(() => Persona, (persona) => persona.rutinas)
  @JoinColumn({ name: 'encargado_id' })
  encargado!: Persona;

  @OneToMany(() => Tarea, (tarea) => tarea.rutina)
  tareas!: Tarea[];
}
