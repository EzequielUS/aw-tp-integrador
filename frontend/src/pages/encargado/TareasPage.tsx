import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Tarea {
  id: number; descripcion: string; estado: string;
  fechaLimite: string | null; incidenteId: number | null; rutinaId: number | null;
}

const ESTADO_BADGE: Record<string, string> = {
  Pendiente: 'badge-pendiente', 'En ejecución': 'badge-ejecucion', Finalizada: 'badge-finalizada',
};
const NEXT_ESTADO: Record<string, string> = { Pendiente: 'En ejecución', 'En ejecución': 'Finalizada' };

export default function TareasPage() {
  const { user } = useAuth();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [selected, setSelected] = useState<Tarea | null>(null);
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');

  async function load() {
    // Encargado ve sus tareas a través de incidentes y rutinas
    const [inc, rut] = await Promise.all([
      api.get<{ data: { id: number }[] }>('/incidentes'),
      api.get<{ data: { id: number }[] }>('/rutinas'),
    ]);
    const tareasInc = await Promise.all(
      inc.data.data.map(i => api.get<{ data: Tarea[] }>(`/incidentes/${i.id}/tareas`))
    );
    const tareasRut = await Promise.all(
      rut.data.data.map(r => api.get<{ data: Tarea[] }>(`/rutinas/${r.id}/tareas`))
    );
    const todas = [
      ...tareasInc.flatMap(r => r.data.data),
      ...tareasRut.flatMap(r => r.data.data),
    ].filter((t: Tarea & { encargado?: { id?: number } }) => (t as { encargado?: { id?: number } }).encargado?.id === user?.id || true);
    setTareas(todas);
  }

  useEffect(() => { load(); }, []);

  async function handleUpdate() {
    if (!selected) return;
    setError('');
    const next = NEXT_ESTADO[selected.estado];
    if (!next) return;
    if (next === 'Finalizada' && !notas.trim()) { setError('Las notas son requeridas al finalizar'); return; }
    try {
      await api.patch(`/tareas/${selected.id}`, {
        estado: next,
        ...(notas.trim() && { notas_finalizacion: notas.trim() }),
      });
      setSelected(null); setNotas(''); load();
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Error');
    }
  }

  const filtered = tareas.filter(t => {
    if (filtroEstado && t.estado !== filtroEstado) return false;
    if (filtroTipo === 'Preventiva' && !t.rutinaId) return false;
    if (filtroTipo === 'Correctiva' && !t.incidenteId) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Mis Tareas</h1>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
          {tareas.filter(t => t.estado === 'Pendiente').length} pendiente(s)
        </span>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Actualizar Tarea #{selected.id}</h2>
            <p style={{ color: '#475569', marginBottom: '0.75rem' }}>{selected.descripcion}</p>
            <p style={{ marginBottom: '1rem' }}>
              Estado actual: <span className={`badge ${ESTADO_BADGE[selected.estado] ?? ''}`}>{selected.estado}</span>
              {NEXT_ESTADO[selected.estado] && <> → <strong>{NEXT_ESTADO[selected.estado]}</strong></>}
            </p>
            {error && <p className="error-msg">{error}</p>}
            {NEXT_ESTADO[selected.estado] === 'Finalizada' && (
              <div className="form-group">
                <label>Notas de finalización</label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Describí cómo se resolvió la tarea..." />
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancelar</button>
              {NEXT_ESTADO[selected.estado] && (
                <button className="btn btn-primary" onClick={handleUpdate}>
                  Pasar a {NEXT_ESTADO[selected.estado]}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="filters">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option>Pendiente</option><option>En ejecución</option><option>Finalizada</option>
        </select>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option>Preventiva</option><option>Correctiva</option>
        </select>
      </div>

      <table>
        <thead>
          <tr><th>#</th><th>Descripción</th><th>Tipo</th><th>Estado</th><th>Vence</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No hay tareas</td></tr>
          )}
          {filtered.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.descripcion.length > 55 ? t.descripcion.slice(0, 55) + '…' : t.descripcion}</td>
              <td>{t.rutinaId ? 'Preventiva' : 'Correctiva'}</td>
              <td><span className={`badge ${ESTADO_BADGE[t.estado] ?? ''}`}>{t.estado}</span></td>
              <td>{t.fechaLimite ? new Date(t.fechaLimite).toLocaleDateString('es-AR') : '—'}</td>
              <td>
                {NEXT_ESTADO[t.estado] && (
                  <button className="btn btn-primary btn-sm" onClick={() => { setSelected(t); setNotas(''); setError(''); }}>
                    Actualizar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
