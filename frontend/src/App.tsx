import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Shared/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AvisosPage from './pages/AvisosPage';
// Residente
import ReclamosPage from './pages/residente/ReclamosPage';
import ReportesPage from './pages/residente/ReportesPage';
// Admin
import TriagePage from './pages/admin/TriagePage';
import IncidentesPage from './pages/admin/IncidentesPage';
import RutinasPage from './pages/admin/RutinasPage';
import AdminAvisosPage from './pages/admin/AdminAvisosPage';
// Encargado
import TareasPage from './pages/encargado/TareasPage';
import RutinasEncargadoPage from './pages/encargado/RutinasEncargadoPage';
import CrearReclamoPage from './pages/encargado/CrearReclamoPage';
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

            {/* Residente */}
            <Route path="residente/reclamos" element={<ReclamosPage />} />
            <Route path="residente/avisos" element={<AvisosPage />} />
            <Route path="residente/reportes" element={<ReportesPage />} />

            {/* Administrador */}
            <Route path="admin/triage" element={<TriagePage />} />
            <Route path="admin/incidentes" element={<IncidentesPage />} />
            <Route path="admin/rutinas" element={<RutinasPage />} />
            <Route path="admin/avisos" element={<AdminAvisosPage />} />

            {/* Encargado */}
            <Route path="encargado/tareas" element={<TareasPage />} />
            <Route path="encargado/rutinas" element={<RutinasEncargadoPage />} />
            <Route path="encargado/crear-reclamo" element={<CrearReclamoPage />} />
            <Route path="encargado/avisos" element={<AvisosPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
