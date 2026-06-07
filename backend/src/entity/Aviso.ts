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

@Entity('Aviso')
export class Aviso {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'administrador_id' })
  administradorId!: number;

  @Column({ type: 'text' })
  titulo!: string;

  @Column({ type: 'text' })
  cuerpo!: string;

  @Column({ name: 'fecha_publicacion', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaPublicacion!: Date;

  @Column({ name: 'eliminado', type: 'integer', default: 0 })
  eliminado!: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;

  @ManyToOne(() => Persona, (persona) => persona.avisos)
  @JoinColumn({ name: 'administrador_id' })
  administrador!: Persona;
}
