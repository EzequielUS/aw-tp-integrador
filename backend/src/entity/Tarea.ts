import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Persona } from './Persona';
import { Incidente } from './Incidente';
import { Rutina } from './Rutina';

export type EstadoTarea = 'Pendiente' | 'En ejecución' | 'Finalizada';

@Entity('Tarea')
export class Tarea {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'encargado_id' })
  encargadoId!: number;

  @Column({ name: 'incidente_id', type: 'integer', nullable: true })
  incidenteId!: number | null;

  @Column({ name: 'rutina_id', type: 'integer', nullable: true })
  rutinaId!: number | null;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'text', default: 'Pendiente' })
  estado!: EstadoTarea;

  @Column({ name: 'fecha_limite', type: 'datetime', nullable: true })
  fechaLimite!: Date | null;

  @Column({ name: 'notas_finalizacion', type: 'text', nullable: true })
  notasFinalizacion!: string | null;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;

  @ManyToOne(() => Persona, (persona) => persona.tareas)
  @JoinColumn({ name: 'encargado_id' })
  encargado!: Persona;

  @ManyToOne(() => Incidente, (incidente) => incidente.tareas, { nullable: true })
  @JoinColumn({ name: 'incidente_id' })
  incidente!: Incidente | null;

  @ManyToOne(() => Rutina, (rutina) => rutina.tareas, { nullable: true })
  @JoinColumn({ name: 'rutina_id' })
  rutina!: Rutina | null;
}
