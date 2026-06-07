import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Counts { reclamos: Record<string, number>; incidentes: Record<string, number>; tareas: Record<string, number>; }

export default function DashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Counts>({ reclamos: {}, incidentes: {}, tareas: {} });

  useEffect(() => {
    async function load() {
      const c: Counts = { reclamos: {}, incidentes: {}, tareas: {} };
      try {
        const { data } = await api.get<{ data: { estado: string }[] }>('/reclamos');
        data.data.forEach(r => { c.reclamos[r.estado] = (c.reclamos[r.estado] ?? 0) + 1; });
      } catch { /* ignore */ }
      try {
        const { data } = await api.get<{ data: { estado: string }[] }>('/incidentes');
        data.data.forEach(i => { c.incidentes[i.estado] = (c.incidentes[i.estado] ?? 0) + 1; });
      } catch { /* ignore */ }
      setCounts(c);
    }
    load();
  }, []);

  const cards = {
    Residente: [
      { label: 'Reclamos Pendientes', value: counts.reclamos['Pendiente'] ?? 0, color: '#f59e0b' },
      { label: 'Reclamos Aprobados', value: counts.reclamos['Aprobado'] ?? 0, color: '#22c55e' },
      { label: 'Reclamos Rechazados', value: counts.reclamos['Rechazado'] ?? 0, color: '#ef4444' },
    ],
    Administrador: [
      { label: 'Reclamos por Revisar', value: counts.reclamos['Pendiente'] ?? 0, color: '#f59e0b' },
      { label: 'Incidentes Abiertos', value: counts.incidentes['Abierto'] ?? 0, color: '#3b82f6' },
      { label: 'Incidentes En Progreso', value: counts.incidentes['En progreso'] ?? 0, color: '#8b5cf6' },
    ],
    Encargado: [
      { label: 'Incidentes Activos', value: (counts.incidentes['Abierto'] ?? 0) + (counts.incidentes['En progreso'] ?? 0), color: '#3b82f6' },
      { label: 'Reclamos Pendientes', value: counts.reclamos['Pendiente'] ?? 0, color: '#f59e0b' },
    ],
  };

  const rol = user?.rol ?? 'Residente';
  const myCards = cards[rol] ?? [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bienvenido, {user?.nombre}</h1>
        <span style={{ color: '#64748b' }}>{rol}</span>
      </div>

      <div className="cards-grid">
        {myCards.map(card => (
          <div className="card stat-card" key={card.label} style={{ borderTop: `4px solid ${card.color}` }}>
            <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Usá el menú lateral para navegar.</p>
    </div>
  );
}
