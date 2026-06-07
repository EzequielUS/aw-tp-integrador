import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const MENU = {
  Residente: [
    { to: '/residente/reclamos', label: 'Mis Reclamos' },
    { to: '/residente/avisos', label: 'Avisos' },
    { to: '/residente/reportes', label: 'Mis Reportes' },
  ],
  Administrador: [
    { to: '/admin/triage', label: 'Triage de Reclamos' },
    { to: '/admin/incidentes', label: 'Gestión de Incidentes' },
    { to: '/admin/rutinas', label: 'Rutinas' },
    { to: '/admin/avisos', label: 'Publicar Avisos' },
  ],
  Encargado: [
    { to: '/encargado/tareas', label: 'Mis Tareas' },
    { to: '/encargado/rutinas', label: 'Mis Rutinas' },
    { to: '/encargado/crear-reclamo', label: 'Crear Reclamo' },
    { to: '/encargado/avisos', label: 'Avisos' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const items = MENU[user.rol] ?? [];

  return (
    <nav className={styles.sidebar}>
      <ul className={styles.menu}>
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
