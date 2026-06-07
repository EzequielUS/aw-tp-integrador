import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Shared/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReclamosPage from './pages/ReclamosPage';
import IncidentesPage from './pages/IncidentesPage';
import AvisosPage from './pages/AvisosPage';
import RutinasPage from './pages/RutinasPage';
import TareasPage from './pages/TareasPage';
import './styles/global.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="reclamos" element={<ReclamosPage />} />
            <Route path="incidentes" element={<IncidentesPage />} />
            <Route path="avisos" element={<AvisosPage />} />
            <Route path="rutinas" element={<RutinasPage />} />
            <Route path="tareas" element={<TareasPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
