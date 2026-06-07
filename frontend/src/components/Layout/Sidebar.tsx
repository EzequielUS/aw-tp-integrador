import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const MENU = {
  Residente: [
    { to: '/dashboard', label: 'General' },
    { to: '/reclamos', label: 'Reclamos' },
    { to: '/incidentes', label: 'Incidentes' },
    { to: '/avisos', label: 'Avisos' },
  ],
  Administrador: [
    { to: '/dashboard', label: 'General' },
    { to: '/reclamos', label: 'Reclamos' },
    { to: '/incidentes', label: 'Incidentes' },
    { to: '/rutinas', label: 'Rutinas' },
    { to: '/avisos', label: 'Avisos' },
  ],
  Encargado: [
    { to: '/dashboard', label: 'General' },
    { to: '/tareas', label: 'Tareas' },
    { to: '/rutinas', label: 'Rutinas' },
    { to: '/reclamos', label: 'Reclamos' },
    { to: '/incidentes', label: 'Incidentes' },
    { to: '/avisos', label: 'Avisos' },
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
