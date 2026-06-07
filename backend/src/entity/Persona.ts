import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Aviso } from './Aviso';
import { Reclamo } from './Reclamo';
import { Rutina } from './Rutina';
import { Tarea } from './Tarea';

export type Rol = 'Residente' | 'Administrador' | 'Encargado';

@Entity('Persona')
export class Persona {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  nombre!: string;

  @Column({ type: 'text' })
  apellido!: string;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text' })
  password!: string;

  @Column({ type: 'text' })
  rol!: Rol;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;

  @OneToMany(() => Aviso, (aviso) => aviso.administrador)
  avisos!: Aviso[];

  @OneToMany(() => Reclamo, (reclamo) => reclamo.creador)
  reclamos!: Reclamo[];

  @OneToMany(() => Rutina, (rutina) => rutina.encargado)
  rutinas!: Rutina[];

  @OneToMany(() => Tarea, (tarea) => tarea.encargado)
  tareas!: Tarea[];
}
