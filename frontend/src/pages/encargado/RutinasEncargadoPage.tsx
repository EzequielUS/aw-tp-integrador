import { useEffect, useState } from 'react';
import api from '../../services/api';

interface Rutina { id: number; fechaAsignacion: string; estado: string; encargado: { nombre: string }; }
interface Tarea { id: number; descripcion: string; estado: string; }

const ESTADO_BADGE: Record<string, string> = {
  Pendiente: 'badge-pendiente', 'En progreso': 'badge-enprogreso', Completada: 'badge-completada',
};

export default function RutinasEncargadoPage() {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [detalle, setDetalle] = useState<{ rutina: Rutina; tareas: Tarea[] } | null>(null);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await api.get<{ data: Rutina[] }>('/rutinas');
    setRutinas(data.data);
  }

  useEffect(() => { load(); }, []);

  async function handleVerDetalle(r: Rutina) {
    const { data } = await api.get<{ data: Tarea[] }>(`/rutinas/${r.id}/tareas`);
    setDetalle({ rutina: r, tareas: data.data });
  }

  async function handleIniciar(r: Rutina) {
    setError('');
    try {
      await api.patch(`/rutinas/${r.id}`, { estado: 'En progreso' });
      load();
      if (detalle?.rutina.id === r.id) handleVerDetalle({ ...r, estado: 'En progreso' });
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Error');
    }
  }

  function progreso(tareas: Tarea[]) {
    if (!tareas.length) return 0;
    return Math.round((tareas.filter(t => t.estado === 'Finalizada').length / tareas.length) * 100);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mis Rutinas</h1>
      </div>

      {detalle && (
        <div className="modal-overlay" onClick={() => setDetalle(null)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <h2>Rutina #{detalle.rutina.id} — {detalle.rutina.fechaAsignacion}</h2>
            <p style={{ marginBottom: '0.5rem' }}>
              Estado: <span className={`badge ${ESTADO_BADGE[detalle.rutina.estado] ?? ''}`}>{detalle.rutina.estado}</span>
            </p>
            <div style={{ background: '#f1f5f9', borderRadius: 6, height: 10, margin: '0.75rem 0', overflow: 'hidden' }}>
              <div style={{ background: '#22c55e', height: '100%', width: `${progreso(detalle.tareas)}%`, transition: 'width 0.3s' }} />
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              {progreso(detalle.tareas)}% completado ({detalle.tareas.filter(t => t.estado === 'Finalizada').length}/{detalle.tareas.length} tareas)
            </p>
            {error && <p className="error-msg">{error}</p>}
            {detalle.rutina.estado === 'Pendiente' && (
              <button className="btn btn-primary" style={{ marginBottom: '1rem' }} onClick={() => handleIniciar(detalle.rutina)}>
                Marcar como En Progreso
              </button>
            )}
            <table>
              <thead><tr><th>Descripción</th><th>Estado</th></tr></thead>
              <tbody>
                {detalle.tareas.map(t => (
                  <tr key={t.id}>
                    <td>{t.descripcion}</td>
                    <td><span className={`badge ${ESTADO_BADGE[t.estado] ?? 'badge-pendiente'}`}>{t.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDetalle(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr><th>#</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {rutinas.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No hay rutinas asignadas</td></tr>
          )}
          {rutinas.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.fechaAsignacion}</td>
              <td><span className={`badge ${ESTADO_BADGE[r.estado] ?? ''}`}>{r.estado}</span></td>
              <td style={{ display: 'flex', gap: '0.4rem' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleVerDetalle(r)}>Ver</button>
                {r.estado === 'Pendiente' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleIniciar(r)}>Iniciar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
