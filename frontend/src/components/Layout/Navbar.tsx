import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className={styles.navbar}>
      <span className={styles.title}>Sistema de Gestión de Consorcio</span>
      <div className={styles.userInfo}>
        <span className={styles.userName}>{user?.nombre} {user?.apellido}</span>
        <span className={styles.userRole}>{user?.rol}</span>
        <button className={styles.logoutBtn} onClick={handleLogout}>Salir</button>
      </div>
    </header>
  );
}
