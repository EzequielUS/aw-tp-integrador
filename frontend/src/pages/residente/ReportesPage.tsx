import { useEffect, useState } from 'react';
import api from '../../services/api';

interface Reclamo { id: number; estado: string; descripcion: string; fechaCreacion: string; }

const COLORES: Record<string, string> = {
  Pendiente: '#f59e0b', Aprobado: '#22c55e', Rechazado: '#ef4444',
};

export default function ReportesPage() {
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);

  useEffect(() => {
    api.get<{ data: Reclamo[] }>('/reclamos').then(r => setReclamos(r.data.data));
  }, []);

  const counts = reclamos.reduce<Record<string, number>>((acc, r) => {
    acc[r.estado] = (acc[r.estado] ?? 0) + 1;
    return acc;
  }, {});

  const total = reclamos.length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mis Reportes</h1>
      </div>

      <div className="cards-grid">
        {Object.entries(counts).map(([estado, count]) => (
          <div className="card stat-card" key={estado} style={{ borderTop: `4px solid ${COLORES[estado] ?? '#94a3b8'}` }}>
            <div className="stat-value" style={{ color: COLORES[estado] ?? '#1e40af' }}>{count}</div>
            <div className="stat-label">{estado}</div>
          </div>
        ))}
        <div className="card stat-card">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total de reclamos</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Detalle de reclamos</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Descripción</th><th>Estado</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          {reclamos.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.descripcion.length > 70 ? r.descripcion.slice(0, 70) + '…' : r.descripcion}</td>
              <td>
                <span className={`badge badge-${r.estado.toLowerCase()}`}>{r.estado}</span>
              </td>
              <td>{new Date(r.fechaCreacion).toLocaleDateString('es-AR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
