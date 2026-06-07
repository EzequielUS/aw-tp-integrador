import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Persona } from './Persona';
import { Unidad } from './Unidad';
import { Incidente } from './Incidente';

export type EstadoReclamo = 'Pendiente' | 'Aprobado' | 'Rechazado';

@Entity('Reclamo')
export class Reclamo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'creador_id' })
  creadorId!: number;

  @Column({ name: 'unidad_id' })
  unidadId!: number;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'text', default: 'Pendiente' })
  estado!: EstadoReclamo;

  @Column({ name: 'motivo_rechazo', type: 'text', nullable: true })
  motivoRechazo!: string | null;

  @Column({ name: 'incidente_id', type: 'integer', nullable: true })
  incidenteId!: number | null;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;

  @ManyToOne(() => Persona, (persona) => persona.reclamos)
  @JoinColumn({ name: 'creador_id' })
  creador!: Persona;

  @ManyToOne(() => Unidad, (unidad) => unidad.reclamos)
  @JoinColumn({ name: 'unidad_id' })
  unidad!: Unidad;

  @OneToOne(() => Incidente, (incidente) => incidente.reclamo)
  @JoinColumn({ name: 'incidente_id' })
  incidente!: Incidente | null;
}
